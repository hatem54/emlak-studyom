-- ========================================================
-- EMLAKSTÜDYOM - SUPABASE VERİTABANI ŞEMASI VE GÜNCELLEMELERİ
-- Bu SQL kodlarını Supabase SQL Editor'de çalıştırabilirsiniz.
-- ========================================================

-- 1. PROFILES TABLOSUNA YENİ ALANLAR
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'pro',
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_banned BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS banned_reason TEXT,
ADD COLUMN IF NOT EXISTS last_seen_at TIMESTAMPTZ DEFAULT NOW();

-- Varsayılan planı 'pro' olarak güncelle
ALTER TABLE public.profiles ALTER COLUMN subscription_plan SET DEFAULT 'pro';

-- 2. LİSANS / ABONELİK KODLARI TABLOSU
CREATE TABLE IF NOT EXISTS public.license_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    duration_days INTEGER NOT NULL DEFAULT 30,
    duration_label TEXT NOT NULL DEFAULT '1 Aylık Pro',
    status TEXT NOT NULL DEFAULT 'active', -- 'active', 'used', 'revoked'
    note TEXT,
    created_by UUID REFERENCES auth.users(id),
    used_by UUID REFERENCES auth.users(id),
    used_by_email TEXT,
    used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexler
CREATE INDEX IF NOT EXISTS idx_license_codes_code ON public.license_codes(code);
CREATE INDEX IF NOT EXISTS idx_license_codes_status ON public.license_codes(status);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription ON public.profiles(subscription_expires_at);

-- 3. GÜVENLİK (ROW LEVEL SECURITY - RLS)
ALTER TABLE public.license_codes ENABLE ROW LEVEL SECURITY;

-- 3.1 Admin kontrol fonksiyonu (Sonsuz özyinelemeyi önler)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
    );
$$;

-- Güvenlik politikaları
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Admins can do all on license_codes" ON public.license_codes;
    DROP POLICY IF EXISTS "Users can check and redeem active codes" ON public.license_codes;
    DROP POLICY IF EXISTS "Users can update code to used" ON public.license_codes;
    DROP POLICY IF EXISTS "Users can view only their own redeemed codes" ON public.license_codes;
END $$;

CREATE POLICY "Admins can do all on license_codes" ON public.license_codes
    FOR ALL
    TO authenticated
    USING (public.is_admin());

-- 🛡️ KULLANICILAR ASLA AKTİF KODLARI LİSTELEYEMEZ VEYA DÜZENLEYEMEZ!
-- Kod yükleme işlemi sadece aşağıdaki atomik redeem_license_code RPC fonksiyonu ile yapılır.
CREATE POLICY "Users can view only their own redeemed codes" ON public.license_codes
    FOR SELECT
    TO authenticated
    USING (used_by = auth.uid());

-- 4. KOD KULLANMA RPC FONKSİYONU (GÜVENLİ VE ATOMİK)
CREATE OR REPLACE FUNCTION public.redeem_license_code(target_code TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_user_id UUID;
    v_user_email TEXT;
    v_code_row RECORD;
    v_current_expires TIMESTAMPTZ;
    v_new_expires TIMESTAMPTZ;
BEGIN
    v_user_id := auth.uid();
    IF v_user_id IS NULL THEN
        RETURN jsonb_build_object('success', false, 'message', 'Oturum açmanız gerekiyor.');
    END IF;

    -- Kullanıcı profilini al
    SELECT email, subscription_expires_at INTO v_user_email, v_current_expires
    FROM public.profiles WHERE id = v_user_id;

    -- Kodu bul ve kilitle
    SELECT * INTO v_code_row 
    FROM public.license_codes 
    WHERE code = target_code AND status = 'active'
    FOR UPDATE;

    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Geçersiz veya daha önce kullanılmış lisans kodu.');
    END IF;

    -- Yeni bitiş tarihini hesapla
    IF v_current_expires IS NOT NULL AND v_current_expires > NOW() THEN
        v_new_expires := v_current_expires + (v_code_row.duration_days || ' days')::INTERVAL;
    ELSE
        v_new_expires := NOW() + (v_code_row.duration_days || ' days')::INTERVAL;
    END IF;

    -- Kodu kullanıldı olarak işaretle
    UPDATE public.license_codes
    SET status = 'used',
        used_by = v_user_id,
        used_by_email = v_user_email,
        used_at = NOW()
    WHERE id = v_code_row.id;

    -- Kullanıcı profilini Pro yap ve süresini uzat
    UPDATE public.profiles
    SET subscription_plan = 'pro',
        subscription_expires_at = v_new_expires
    WHERE id = v_user_id;

    RETURN jsonb_build_object(
        'success', true, 
        'message', 'Tebrikler! ' || v_code_row.duration_label || ' hesabınıza tanımlandı.',
        'expires_at', v_new_expires,
        'duration_label', v_code_row.duration_label
    );
END;
$$;

-- 5. PROFILES RLS (GÜVENLİK POLİTİKALARI)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Admins can view and update all profiles" ON public.profiles;
    DROP POLICY IF EXISTS "Users can view and update their own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
    DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
END $$;

-- 5.1 Adminler tüm profilleri görebilir ve yönetebilir
CREATE POLICY "Admins can view and update all profiles" ON public.profiles
    FOR ALL
    TO authenticated
    USING (public.is_admin());

-- 5.2 Kullanıcılar sadece kendi profillerini görebilir
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

-- 5.3 Kullanıcılar sadece kendi profillerini güncelleyebilir
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- 5.4 🛡️ HASSAS ALAN KORUMA TETİKLEYİCİSİ (Role, Plan, Ban durumunun kullanıcı tarafından değiştirilmesini engeller)
CREATE OR REPLACE FUNCTION public.protect_profile_roles()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Eğer işlemi yapan admin değilse, rol, abonelik ve yasaklama alanlarını eski değerde kilitle
    IF NOT public.is_admin() THEN
        NEW.role := OLD.role;
        NEW.subscription_plan := OLD.subscription_plan;
        NEW.subscription_expires_at := OLD.subscription_expires_at;
        NEW.is_banned := OLD.is_banned;
        NEW.banned_reason := OLD.banned_reason;
    END IF;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_protect_profile_roles ON public.profiles;
CREATE TRIGGER trg_protect_profile_roles
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.protect_profile_roles();

-- 6. LANSMAN DÖNEMİ: YENİ KAYITLARA OTOMATİK PRO ABONELİK VE TOPLU GÜNCELLEME
-- 6.1. Mevcut tüm kayıtlı kullanıcıları tek seferde Pro yapmak için:
UPDATE public.profiles 
SET subscription_plan = 'pro', 
    subscription_expires_at = NULL 
WHERE role != 'admin' AND (subscription_plan IS NULL OR subscription_plan = 'demo');

-- 6.2. Yeni kayıt olan kullanıcılara otomatik Pro atayan trigger fonksiyonu:
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (id, email, full_name, role, subscription_plan, subscription_expires_at, created_at)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Yeni Kullanıcı'),
        'user',
        'pro', -- Lansman aşamasında otomatik Pro
        NULL,
        NOW()
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email,
        full_name = COALESCE(EXCLUDED.full_name, profiles.full_name),
        subscription_plan = 'pro';
    RETURN NEW;
END;
$$;

-- Trigger'ı auth.users tablosuna bağla (Yeni kayıt olduğunda otomatik çalışır):
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_profile();



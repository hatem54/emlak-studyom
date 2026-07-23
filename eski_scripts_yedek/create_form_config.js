const fs = require('fs');

const formConfigJs = `
const propertyForms = {
    // 🏠 KONUTLAR
    "satilik_daire": {
        badge: "SATILIK DAİRE",
        fields: [
            { id: "priceInput", label: "Fiyat", value: "6.750.000 TL", canvasFormat: "" },
            { id: "f_brut", label: "Brüt m²", value: "140 m²", canvasFormat: "{value} Brüt" },
            { id: "f_net", label: "Net m²", value: "120 m²", canvasFormat: "{value} Net" },
            { id: "f_oda", label: "Oda Sayısı", value: "3+1", canvasFormat: "{value} Geniş Oda" },
            { id: "f_yas", label: "Bina Yaşı", value: "Sıfır", canvasFormat: "{value} Yaşında" },
            { id: "f_kat", label: "Bulunduğu Kat", value: "5. Kat", canvasFormat: "{value}" },
            { id: "f_isitma", label: "Isıtma", value: "Doğalgaz Kombi", canvasFormat: "{value}" },
            { id: "f_konum", label: "Konum", value: "Merkezi", canvasFormat: "{value}" }
        ]
    },
    "kiralik_daire": {
        badge: "KİRALIK DAİRE",
        fields: [
            { id: "priceInput", label: "Kira Bedeli", value: "25.000 TL", canvasFormat: "" },
            { id: "f_brut", label: "Brüt m²", value: "120 m²", canvasFormat: "{value} Brüt" },
            { id: "f_net", label: "Net m²", value: "100 m²", canvasFormat: "{value} Net" },
            { id: "f_oda", label: "Oda Sayısı", value: "2+1", canvasFormat: "{value} Geniş Oda" },
            { id: "f_depozito", label: "Depozito", value: "2 Kira", canvasFormat: "{value} Depozito" },
            { id: "f_aidat", label: "Aidat", value: "1.000 TL", canvasFormat: "Aidat: {value}" },
            { id: "f_isitma", label: "Isıtma", value: "Doğalgaz", canvasFormat: "{value}" },
            { id: "f_konum", label: "Konum", value: "Merkeze Yakın", canvasFormat: "{value}" }
        ]
    },
    "satilik_villa": {
        badge: "SATILIK VİLLA",
        fields: [
            { id: "priceInput", label: "Fiyat", value: "15.000.000 TL", canvasFormat: "" },
            { id: "f_brut", label: "Brüt m²", value: "300 m²", canvasFormat: "{value} Brüt" },
            { id: "f_net", label: "Net m²", value: "250 m²", canvasFormat: "{value} Net" },
            { id: "f_arsa", label: "Arsa Alanı", value: "500 m²", canvasFormat: "{value} Arsa" },
            { id: "f_oda", label: "Oda Sayısı", value: "5+2", canvasFormat: "{value} Geniş Oda" },
            { id: "f_banyo", label: "Banyo Sayısı", value: "3", canvasFormat: "{value} Banyo" },
            { id: "f_havuz", label: "Havuz", value: "Özel Havuzlu", canvasFormat: "{value}" },
            { id: "f_bahce", label: "Bahçe", value: "Peyzajlı", canvasFormat: "{value} Bahçe" }
        ]
    },
    "kiralik_villa": {
        badge: "KİRALIK VİLLA",
        fields: [
            { id: "priceInput", label: "Kira Bedeli", value: "60.000 TL", canvasFormat: "" },
            { id: "f_brut", label: "Brüt m²", value: "280 m²", canvasFormat: "{value} Brüt" },
            { id: "f_net", label: "Net m²", value: "220 m²", canvasFormat: "{value} Net" },
            { id: "f_arsa", label: "Arsa Alanı", value: "400 m²", canvasFormat: "{value} Arsa" },
            { id: "f_oda", label: "Oda Sayısı", value: "4+1", canvasFormat: "{value} Geniş Oda" },
            { id: "f_banyo", label: "Banyo Sayısı", value: "2", canvasFormat: "{value} Banyo" },
            { id: "f_havuz", label: "Havuz", value: "Ortak Havuzlu", canvasFormat: "{value}" },
            { id: "f_bahce", label: "Bahçe", value: "Var", canvasFormat: "{value} Bahçeli" }
        ]
    },
    "satilik_mustakil_ev": {
        badge: "MÜSTAKİL EV",
        fields: [
            { id: "priceInput", label: "Fiyat", value: "8.500.000 TL", canvasFormat: "" },
            { id: "f_brut", label: "Brüt m²", value: "180 m²", canvasFormat: "{value} Brüt" },
            { id: "f_net", label: "Net m²", value: "150 m²", canvasFormat: "{value} Net" },
            { id: "f_arsa", label: "Arsa Alanı", value: "350 m²", canvasFormat: "{value} Arsa" },
            { id: "f_oda", label: "Oda Sayısı", value: "3+1", canvasFormat: "{value} Geniş Oda" },
            { id: "f_bahce", label: "Bahçe", value: "Geniş Bahçe", canvasFormat: "{value}" },
            { id: "f_isitma", label: "Isıtma", value: "Kat Kaloriferi", canvasFormat: "{value}" }
        ]
    },
    "satilik_koy_evi": {
        badge: "KÖY EVİ",
        fields: [
            { id: "priceInput", label: "Fiyat", value: "2.500.000 TL", canvasFormat: "" },
            { id: "f_alan", label: "Ev Alanı", value: "100 m²", canvasFormat: "{value} Ev Alanı" },
            { id: "f_arsa", label: "Arsa Alanı", value: "1000 m²", canvasFormat: "{value} Arsa" },
            { id: "f_oda", label: "Oda Sayısı", value: "2+1", canvasFormat: "{value} Oda" },
            { id: "f_bahce", label: "Bahçe", value: "Meyve Bahçeli", canvasFormat: "{value}" },
            { id: "f_ahir", label: "Ahır", value: "Var", canvasFormat: "{value} Ahır" },
            { id: "f_su", label: "Su Durumu", value: "Artezyen", canvasFormat: "{value}" }
        ]
    },
    "satilik_residence": {
        badge: "RESIDENCE",
        fields: [
            { id: "priceInput", label: "Fiyat", value: "12.000.000 TL", canvasFormat: "" },
            { id: "f_brut", label: "Brüt m²", value: "150 m²", canvasFormat: "{value} Brüt" },
            { id: "f_net", label: "Net m²", value: "120 m²", canvasFormat: "{value} Net" },
            { id: "f_oda", label: "Oda Sayısı", value: "3+1", canvasFormat: "{value} Geniş Oda" },
            { id: "f_kat", label: "Kat", value: "15. Kat", canvasFormat: "{value}" },
            { id: "f_aidat", label: "Aidat", value: "2.500 TL", canvasFormat: "Aidat: {value}" },
            { id: "f_site", label: "Site Özellikleri", value: "Kapalı Havuz, Gym", canvasFormat: "{value}" }
        ]
    },
    "satilik_yazlik": {
        badge: "YAZLIK",
        fields: [
            { id: "priceInput", label: "Fiyat", value: "7.000.000 TL", canvasFormat: "" },
            { id: "f_brut", label: "Brüt m²", value: "140 m²", canvasFormat: "{value} Brüt" },
            { id: "f_net", label: "Net m²", value: "110 m²", canvasFormat: "{value} Net" },
            { id: "f_oda", label: "Oda Sayısı", value: "3+1", canvasFormat: "{value} Geniş Oda" },
            { id: "f_deniz", label: "Denize Uzaklık", value: "100m", canvasFormat: "Denize {value}" },
            { id: "f_bahce", label: "Bahçe", value: "Müstakil", canvasFormat: "{value} Bahçe" },
            { id: "f_manzara", label: "Manzara", value: "Deniz Manzaralı", canvasFormat: "{value}" }
        ]
    },
    "satilik_bungalov": {
        badge: "BUNGALOV",
        fields: [
            { id: "priceInput", label: "Fiyat", value: "3.500.000 TL", canvasFormat: "" },
            { id: "f_brut", label: "m²", value: "60 m²", canvasFormat: "{value}" },
            { id: "f_oda", label: "Oda Sayısı", value: "1+1", canvasFormat: "{value} Oda" },
            { id: "f_arsa", label: "Arsa Alanı", value: "300 m²", canvasFormat: "{value} Arsa" },
            { id: "f_isitma", label: "Isıtma", value: "Şömine + Klima", canvasFormat: "{value}" },
            { id: "f_manzara", label: "Manzara", value: "Doğa Manzaralı", canvasFormat: "{value}" },
            { id: "f_bahce", label: "Bahçe", value: "Özel Tasarım", canvasFormat: "{value} Bahçe" }
        ]
    },

    // 🏢 TİCARİ
    "satilik_dukkan": {
        badge: "SATILIK DÜKKAN",
        fields: [
            { id: "priceInput", label: "Fiyat", value: "9.000.000 TL", canvasFormat: "" },
            { id: "f_m2", label: "m²", value: "150 m²", canvasFormat: "{value} Kapalı Alan" },
            { id: "f_cephe", label: "Cephe", value: "8 Metre", canvasFormat: "{value} Cephe" },
            { id: "f_kat", label: "Kat", value: "Düz Giriş", canvasFormat: "{value}" },
            { id: "f_aidat", label: "Aidat", value: "500 TL", canvasFormat: "Aidat: {value}" },
            { id: "f_kullanim", label: "Kullanım Durumu", value: "Kiracılı", canvasFormat: "{value}" }
        ]
    },
    "kiralik_dukkan": {
        badge: "KİRALIK DÜKKAN",
        fields: [
            { id: "priceInput", label: "Kira Bedeli", value: "35.000 TL", canvasFormat: "" },
            { id: "f_m2", label: "m²", value: "100 m²", canvasFormat: "{value} Kapalı Alan" },
            { id: "f_cephe", label: "Cephe", value: "5 Metre", canvasFormat: "{value} Cephe" },
            { id: "f_kat", label: "Kat", value: "Giriş + Asma Kat", canvasFormat: "{value}" },
            { id: "f_aidat", label: "Aidat", value: "300 TL", canvasFormat: "Aidat: {value}" },
            { id: "f_kullanim", label: "Kullanım Durumu", value: "Boş", canvasFormat: "{value}" }
        ]
    },
    "satilik_ofis": {
        badge: "SATILIK OFİS",
        fields: [
            { id: "priceInput", label: "Fiyat", value: "4.500.000 TL", canvasFormat: "" },
            { id: "f_m2", label: "m²", value: "80 m²", canvasFormat: "{value} Alan" },
            { id: "f_oda", label: "Oda Sayısı", value: "2 Bölüm", canvasFormat: "{value}" },
            { id: "f_kat", label: "Kat", value: "3. Kat", canvasFormat: "{value}" },
            { id: "f_otopark", label: "Otopark", value: "1 Araçlık", canvasFormat: "{value} Otopark" },
            { id: "f_asansor", label: "Asansör", value: "Var", canvasFormat: "{value} Asansör" }
        ]
    },
    "kiralik_ofis": {
        badge: "KİRALIK OFİS",
        fields: [
            { id: "priceInput", label: "Kira Bedeli", value: "15.000 TL", canvasFormat: "" },
            { id: "f_m2", label: "m²", value: "100 m²", canvasFormat: "{value} Alan" },
            { id: "f_oda", label: "Oda Sayısı", value: "3 Bölüm", canvasFormat: "{value}" },
            { id: "f_kat", label: "Kat", value: "2. Kat", canvasFormat: "{value}" },
            { id: "f_otopark", label: "Otopark", value: "Var", canvasFormat: "{value} Otopark" },
            { id: "f_asansor", label: "Asansör", value: "Çift Asansör", canvasFormat: "{value}" }
        ]
    },
    "satilik_plaza_ofisi": {
        badge: "PLAZA OFİSİ",
        fields: [
            { id: "priceInput", label: "Fiyat", value: "25.000.000 TL", canvasFormat: "" },
            { id: "f_m2", label: "m²", value: "250 m²", canvasFormat: "{value} Alan" },
            { id: "f_kat", label: "Kat", value: "12. Kat", canvasFormat: "{value}" },
            { id: "f_toplanti", label: "Toplantı Odası", value: "Özel Toplantı Salonu", canvasFormat: "{value}" },
            { id: "f_otopark", label: "Otopark", value: "4 Araçlık Tahsisli", canvasFormat: "{value} Otopark" },
            { id: "f_aidat", label: "Aidat", value: "4.500 TL", canvasFormat: "Aidat: {value}" }
        ]
    },
    "satilik_is_merkezi": {
        badge: "İŞ MERKEZİ",
        fields: [
            { id: "priceInput", label: "Fiyat", value: "150.000.000 TL", canvasFormat: "" },
            { id: "f_m2", label: "Toplam m²", value: "4000 m²", canvasFormat: "{value} Toplam Alan" },
            { id: "f_kat", label: "Kat Sayısı", value: "10 Katlı", canvasFormat: "{value}" },
            { id: "f_asansor", label: "Asansör", value: "Yük + Yolcu", canvasFormat: "{value} Asansör" },
            { id: "f_otopark", label: "Otopark", value: "Açık/Kapalı Kapasite: 50", canvasFormat: "{value} Otopark" },
            { id: "f_kullanim", label: "Kullanım Durumu", value: "Kısmi Kiracılı", canvasFormat: "{value}" }
        ]
    },

    // 🌲 ARSA
    "satilik_arsa": {
        badge: "SATILIK ARSA",
        fields: [
            { id: "priceInput", label: "Fiyat", value: "5.000.000 TL", canvasFormat: "" },
            { id: "f_m2", label: "m²", value: "500 m²", canvasFormat: "{value} Alan" },
            { id: "f_ada", label: "Ada No", value: "145", canvasFormat: "Ada: {value}" },
            { id: "f_parsel", label: "Parsel No", value: "12", canvasFormat: "Parsel: {value}" },
            { id: "f_imar", label: "İmar Durumu", value: "Konut İmarlı", canvasFormat: "{value}" },
            { id: "f_kaks", label: "Kaks", value: "1.20", canvasFormat: "Kaks: {value}" },
            { id: "f_gabari", label: "Gabari", value: "H: 15.50 (5 Kat)", canvasFormat: "Gabari: {value}" }
        ]
    },
    "satilik_tarla": {
        badge: "SATILIK TARLA",
        fields: [
            { id: "priceInput", label: "Fiyat", value: "1.250.000 TL", canvasFormat: "" },
            { id: "f_m2", label: "m²", value: "4500 m²", canvasFormat: "{value} Alan" },
            { id: "f_ada", label: "Ada No", value: "112", canvasFormat: "Ada: {value}" },
            { id: "f_parsel", label: "Parsel No", value: "3", canvasFormat: "Parsel: {value}" },
            { id: "f_su", label: "Su Durumu", value: "Artezyen Su", canvasFormat: "{value}" },
            { id: "f_cephe", label: "Yola Cephe", value: "Köy Yoluna Cepheli", canvasFormat: "{value}" }
        ]
    },
    "satilik_bag_bahce": {
        badge: "BAĞ / BAHÇE",
        fields: [
            { id: "priceInput", label: "Fiyat", value: "3.000.000 TL", canvasFormat: "" },
            { id: "f_m2", label: "m²", value: "2000 m²", canvasFormat: "{value} Alan" },
            { id: "f_agac", label: "Ağaç Sayısı", value: "50 Ceviz, 20 Kiraz", canvasFormat: "{value}" },
            { id: "f_su", label: "Su Durumu", value: "Sondaj Var", canvasFormat: "{value}" },
            { id: "f_elektrik", label: "Elektrik", value: "Abonelik Mevcut", canvasFormat: "Elektrik: {value}" },
            { id: "f_cephe", label: "Yola Cephe", value: "Asfalt Cepheli", canvasFormat: "{value}" }
        ]
    },
    "satilik_ticari_arsa": {
        badge: "TİCARİ ARSA",
        fields: [
            { id: "priceInput", label: "Fiyat", value: "20.000.000 TL", canvasFormat: "" },
            { id: "f_m2", label: "m²", value: "1500 m²", canvasFormat: "{value} Alan" },
            { id: "f_ada", label: "Ada No", value: "85", canvasFormat: "Ada: {value}" },
            { id: "f_parsel", label: "Parsel No", value: "2", canvasFormat: "Parsel: {value}" },
            { id: "f_emsal", label: "Emsal", value: "2.0", canvasFormat: "Emsal: {value}" },
            { id: "f_imar", label: "İmar Durumu", value: "Ticari İmarlı", canvasFormat: "{value}" }
        ]
    },
    "satilik_sanayi_arsasi": {
        badge: "SANAYİ ARSASI",
        fields: [
            { id: "priceInput", label: "Fiyat", value: "45.000.000 TL", canvasFormat: "" },
            { id: "f_m2", label: "m²", value: "5000 m²", canvasFormat: "{value} Alan" },
            { id: "f_ada", label: "Ada No", value: "22", canvasFormat: "Ada: {value}" },
            { id: "f_parsel", label: "Parsel No", value: "1", canvasFormat: "Parsel: {value}" },
            { id: "f_sanayi", label: "Sanayi İmarlı", value: "Evet", canvasFormat: "Sanayi İmarlı: {value}" },
            { id: "f_cephe", label: "Yola Cephe", value: "Otoyola Cepheli", canvasFormat: "{value}" }
        ]
    },

    // 🏗️ PROJELER
    "satilik_konut_projesi": {
        badge: "KONUT PROJESİ",
        fields: [
            { id: "priceInput", label: "Başlangıç Fiyatı", value: "5.000.000 TL'den Başlayan", canvasFormat: "" },
            { id: "f_teslim", label: "Teslim Tarihi", value: "Aralık 2025", canvasFormat: "Teslim: {value}" },
            { id: "f_tipler", label: "Daire Tipleri", value: "1+1, 2+1, 3+1", canvasFormat: "Tipler: {value}" },
            { id: "f_blok", label: "Toplam Blok", value: "4 Blok", canvasFormat: "{value}" },
            { id: "f_daire_sayisi", label: "Toplam Daire", value: "250 Daire", canvasFormat: "{value}" },
            { id: "f_lokasyon", label: "Lokasyon", value: "Merkez", canvasFormat: "Konum: {value}" }
        ]
    },
    "satilik_villa_projesi": {
        badge: "VİLLA PROJESİ",
        fields: [
            { id: "priceInput", label: "Başlangıç Fiyatı", value: "25.000.000 TL'den Başlayan", canvasFormat: "" },
            { id: "f_tipler", label: "Villa Tipleri", value: "4+1, 5+2 Tripleks", canvasFormat: "Tipler: {value}" },
            { id: "f_arsa", label: "Arsa Alanı", value: "Min 500m²", canvasFormat: "Arsa: {value}" },
            { id: "f_teslim", label: "Teslim Tarihi", value: "Hemen Teslim", canvasFormat: "Teslim: {value}" },
            { id: "f_lokasyon", label: "Lokasyon", value: "Doğa İçi", canvasFormat: "Konum: {value}" }
        ]
    },
    "satilik_rezidans_projesi": {
        badge: "REZİDANS PROJESİ",
        fields: [
            { id: "priceInput", label: "Başlangıç Fiyatı", value: "8.500.000 TL'den Başlayan", canvasFormat: "" },
            { id: "f_tipler", label: "Daire Tipleri", value: "Stüdyo, 1+1, 2+1", canvasFormat: "Tipler: {value}" },
            { id: "f_teslim", label: "Teslim Tarihi", value: "Haziran 2026", canvasFormat: "Teslim: {value}" },
            { id: "f_sosyal", label: "Sosyal Alanlar", value: "Havuz, Spa, Gym", canvasFormat: "{value}" },
            { id: "f_lokasyon", label: "Lokasyon", value: "İş Merkezi Yakını", canvasFormat: "Konum: {value}" }
        ]
    },
    "satilik_ticari_proje": {
        badge: "TİCARİ PROJE",
        fields: [
            { id: "priceInput", label: "Başlangıç Fiyatı", value: "15.000.000 TL'den Başlayan", canvasFormat: "" },
            { id: "f_teslim", label: "Teslim Tarihi", value: "Ağustos 2025", canvasFormat: "Teslim: {value}" },
            { id: "f_dukkan", label: "Dükkan Sayısı", value: "20", canvasFormat: "{value} Dükkan" },
            { id: "f_ofis", label: "Ofis Sayısı", value: "50", canvasFormat: "{value} Ofis" },
            { id: "f_lokasyon", label: "Lokasyon", value: "Ana Arter Üzeri", canvasFormat: "Konum: {value}" }
        ]
    },

    // ⭐ PREMIUM
    "satilik_luks_villa": {
        badge: "LÜKS VİLLA",
        fields: [
            { id: "priceInput", label: "Fiyat", value: "35.000.000 TL", canvasFormat: "" },
            { id: "f_brut", label: "Brüt m²", value: "450 m²", canvasFormat: "{value} Brüt" },
            { id: "f_net", label: "Net m²", value: "380 m²", canvasFormat: "{value} Net" },
            { id: "f_arsa", label: "Arsa Alanı", value: "1000 m²", canvasFormat: "{value} Arsa" },
            { id: "f_oda", label: "Oda Sayısı", value: "6+2", canvasFormat: "{value} Geniş Oda" },
            { id: "f_havuz", label: "Havuz", value: "Sonsuzluk Havuzu", canvasFormat: "{value}" },
            { id: "f_akilli", label: "Akıllı Ev Sistemi", value: "Full Otomasyon", canvasFormat: "{value}" },
            { id: "f_peyzaj", label: "Özel Peyzaj", value: "Mimari Tasarım", canvasFormat: "{value} Peyzaj" }
        ]
    },
    "satilik_deniz_manzarali": {
        badge: "DENİZ MANZARALI",
        fields: [
            { id: "priceInput", label: "Fiyat", value: "18.000.000 TL", canvasFormat: "" },
            { id: "f_brut", label: "Brüt m²", value: "200 m²", canvasFormat: "{value} Brüt" },
            { id: "f_net", label: "Net m²", value: "170 m²", canvasFormat: "{value} Net" },
            { id: "f_oda", label: "Oda Sayısı", value: "4+1", canvasFormat: "{value} Geniş Oda" },
            { id: "f_deniz", label: "Denize Mesafe", value: "Sıfır", canvasFormat: "Denize {value}" },
            { id: "f_manzara", label: "Manzara Türü", value: "Kapanmaz Full Deniz", canvasFormat: "{value} Manzaralı" }
        ]
    },
    "satilik_havuzlu_villa": {
        badge: "HAVUZLU VİLLA",
        fields: [
            { id: "priceInput", label: "Fiyat", value: "22.500.000 TL", canvasFormat: "" },
            { id: "f_brut", label: "Brüt m²", value: "320 m²", canvasFormat: "{value} Brüt" },
            { id: "f_net", label: "Net m²", value: "280 m²", canvasFormat: "{value} Net" },
            { id: "f_arsa", label: "Arsa Alanı", value: "600 m²", canvasFormat: "{value} Arsa" },
            { id: "f_oda", label: "Oda Sayısı", value: "5+1", canvasFormat: "{value} Geniş Oda" },
            { id: "f_olcu", label: "Havuz Ölçüsü", value: "40 m²", canvasFormat: "{value} Özel Havuz" },
            { id: "f_bahce", label: "Bahçe", value: "Özel Mahremiyetli", canvasFormat: "{value} Bahçe" }
        ]
    },
    "satilik_akilli_ev": {
        badge: "AKILLI EV",
        fields: [
            { id: "priceInput", label: "Fiyat", value: "14.000.000 TL", canvasFormat: "" },
            { id: "f_brut", label: "Brüt m²", value: "160 m²", canvasFormat: "{value} Brüt" },
            { id: "f_net", label: "Net m²", value: "135 m²", canvasFormat: "{value} Net" },
            { id: "f_oda", label: "Oda Sayısı", value: "3+1", canvasFormat: "{value} Geniş Oda" },
            { id: "f_akilli", label: "Akıllı Ev Özellikleri", value: "Uzaktan Erişim, İklimlendirme", canvasFormat: "{value}" },
            { id: "f_enerji", label: "Enerji Sınıfı", value: "A+ Enerji", canvasFormat: "{value}" }
        ]
    },
    "satilik_ultra_luks_villa": {
        badge: "ULTRA LÜKS VİLLA",
        fields: [
            { id: "priceInput", label: "Fiyat", value: "75.000.000 TL", canvasFormat: "" },
            { id: "f_brut", label: "Brüt m²", value: "800 m²", canvasFormat: "{value} Brüt" },
            { id: "f_net", label: "Net m²", value: "650 m²", canvasFormat: "{value} Net" },
            { id: "f_arsa", label: "Arsa Alanı", value: "2000 m²", canvasFormat: "{value} Arsa" },
            { id: "f_oda", label: "Oda Sayısı", value: "8+2", canvasFormat: "{value} Geniş Oda" },
            { id: "f_otopark", label: "Kapalı Otopark", value: "4 Araçlık", canvasFormat: "{value} Otopark" },
            { id: "f_havuz", label: "Özel Havuz", value: "Isıtmalı", canvasFormat: "{value} Havuz" },
            { id: "f_akilli", label: "Akıllı Ev Sistemi", value: "KNX Sistem", canvasFormat: "{value}" }
        ]
    }
};

window.propertyForms = propertyForms;
`;

fs.writeFileSync('js/formConfig.js', formConfigJs);
console.log('Created js/formConfig.js successfully.');

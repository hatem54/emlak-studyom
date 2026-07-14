// Supabase Client Initialization
const SUPABASE_URL = 'https://tijbyiqwqnxksapacyan.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpamJ5aXF3cW54a3NhcGFjeWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5ODc5NzIsImV4cCI6MjA5OTU2Mzk3Mn0.6I1CbUKyvbf2CovZI154osgPOiblg7ZSsOgKiSdzUVI';

// Supabase client'ı global olarak oluştur
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Global erişim için window'a ekle
window.supabaseClient = supabaseClient;

console.log('✅ Supabase bağlantısı kuruldu');

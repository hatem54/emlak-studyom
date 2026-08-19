// Supabase Client Initialization
const SUPABASE_URL = 'https://tijbyiqwqnxksapacyan.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpamJ5aXF3cW54a3NhcGFjeWFuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM5ODc5NzIsImV4cCI6MjA5OTU2Mzk3Mn0.6I1CbUKyvbf2CovZI154osgPOiblg7ZSsOgKiSdzUVI';

function initSupabase() {
    if (window.supabase && typeof window.supabase.createClient === 'function') {
        if (!window.supabaseClient) {
            window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('✅ Supabase bağlantısı kuruldu');
        }
        return window.supabaseClient;
    }
    return window.supabaseClient || null;
}

initSupabase();

window.initSupabase = initSupabase;

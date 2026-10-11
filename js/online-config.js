// Online play settings. Leave these empty to play offline only.
// All three values are public (they are meant to be in the website), so it is safe to commit this file.
window.ONLINE = {
  supabaseUrl: '',   // Supabase → Project Settings → API → Project URL, like 'https://abcd1234.supabase.co'
  supabaseKey: '',   // Supabase → Project Settings → API Keys → Publishable key (starts with sb_publishable_) or the anon key
  serverUrl: ''      // Your Cloudflare Worker address, like 'https://india-bay-online.yourname.workers.dev'
};

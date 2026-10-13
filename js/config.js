/* Studio backend settings (Supabase). Paste the two values from:
   Supabase → Project Settings → API. The anon key is public by design;
   the database rules in supabase/setup.sql decide what it may do. */
window.TO_CONFIG = {
  SUPABASE_URL: '',       // e.g. 'https://abcd1234.supabase.co'
  SUPABASE_ANON_KEY: '',  // the "anon public" key
};

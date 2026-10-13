# TZIRA OPENHAIM · Interior Design Studio — website

Static one-page site (Hebrew / English) + a private admin area for leads and visit statistics.

```
index.html          the site
admin/index.html    studio admin: leads (new / handled, notes) + live visit stats
js/config.js        Supabase URL + anon key (fill in once)
js/backend.js       sends the contact form and logs visits (source, device, language)
supabase/setup.sql  database tables + security rules (run once in Supabase)
rooms/ tex/         images and textures
reel_*.mp4          hero films (horizontal for desktop, vertical for phones)
```

## Going live
1. **GitHub Pages:** Settings → Pages → Deploy from branch → `main` / root.
2. **Domain:** add the domain in Settings → Pages → Custom domain, and point the DNS at GitHub Pages
   (A records 185.199.108.153 / .109 / .110 / .111, or a CNAME for `www` to `<user>.github.io`).

## Leads + statistics (Supabase, free tier)
1. Create a project at supabase.com.
2. SQL Editor → paste `supabase/setup.sql` → Run. (The admin email is set inside the file.)
3. Authentication → Users → Add user: the studio email + a strong password.
4. Project Settings → API: copy *Project URL* and *anon public* key into `js/config.js`.
5. Open `/admin/` on the site and sign in.

Until `js/config.js` is filled in, the form shows a polite notice and `/admin/` opens in a sample-data preview mode.

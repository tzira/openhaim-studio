/* Lead form + privacy-light visit log → Supabase. Inactive until js/config.js is filled in. */
(() => {
  const C = window.TO_CONFIG || {};
  const api = { ready: false, submitLead: async () => { throw new Error('backend not configured'); } };
  window.TOBackend = api;
  if (!C.SUPABASE_URL || !C.SUPABASE_ANON_KEY) return;
  const base = C.SUPABASE_URL.replace(/\/$/, '') + '/rest/v1/';
  const headers = { apikey: C.SUPABASE_ANON_KEY, 'Content-Type': 'application/json', Prefer: 'return=minimal' };
  if (/^eyJ/.test(C.SUPABASE_ANON_KEY)) headers.Authorization = 'Bearer ' + C.SUPABASE_ANON_KEY;  // legacy JWT keys only
  const post = (table, row) => fetch(base + table, { method: 'POST', headers, body: JSON.stringify(row), keepalive: true })
    .then(r => { if (!r.ok) throw new Error(table + ' ' + r.status); });

  // where did the visitor come from?
  const q = new URLSearchParams(location.search);
  const ref = document.referrer && !document.referrer.startsWith(location.origin) ? document.referrer : '';
  const host = ref ? (() => { try { return new URL(ref).hostname.replace(/^www\./, ''); } catch (e) { return ''; } })() : '';
  const SOURCES = [[/google\./, 'Google'], [/bing\.|duckduckgo|yahoo\./, 'מנוע חיפוש'], [/instagram\./, 'Instagram'], [/facebook\.|fb\.|messenger/, 'Facebook'],
    [/whatsapp|wa\.me/, 'WhatsApp'], [/pinterest\.|pin\.it/, 'Pinterest'], [/linkedin\.|lnkd\.in/, 'LinkedIn'], [/t\.co$|twitter\.|x\.com/, 'X'], [/tiktok\./, 'TikTok'], [/mail\.|outlook|gmail/, 'Email']];
  let source = q.get('utm_source') || '';
  if (!source && host) { const m = SOURCES.find(([re]) => re.test(host)); source = m ? m[1] : host; }
  if (!source) source = 'ישיר';
  let sid = ''; try { sid = sessionStorage.getItem('to-sid') || ''; if (!sid) { sid = Math.random().toString(36).slice(2, 12); sessionStorage.setItem('to-sid', sid); } } catch (e) {}
  const device = /Mobi|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : /iPad|Tablet/i.test(navigator.userAgent) ? 'tablet' : 'desktop';
  const ctx = { session_id: sid, source, referrer: ref.slice(0, 300), utm_source: q.get('utm_source'), utm_medium: q.get('utm_medium'), utm_campaign: q.get('utm_campaign'), device, lang: document.documentElement.lang || 'he' };

  if (!/[?&]notrack/.test(location.search)) {
    let seen = false; try { seen = sessionStorage.getItem('to-seen') === '1'; sessionStorage.setItem('to-seen', '1'); } catch (e) {}
    if (!seen) post('visits', { ...ctx, path: location.pathname }).catch(() => {});
  }
  api.ready = true;
  api.submitLead = lead => post('leads', { name: lead.name, phone: lead.phone || null, email: lead.email || null, message: lead.message || null, lang: lead.lang, source, session_id: sid });
})();

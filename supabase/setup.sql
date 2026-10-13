-- TZIRA OPENHAIM studio site: leads + visits.
-- Run once in Supabase → SQL Editor. Then create your admin user in
-- Authentication → Users (Add user, with the studio email and a strong password),
-- and put that same email in the line marked ADMIN EMAIL below before running.

create table if not exists public.leads (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  name text not null check (char_length(name) between 1 and 120),
  phone text check (char_length(phone) <= 40),
  email text check (char_length(email) <= 160),
  message text check (char_length(message) <= 4000),
  lang text, source text, session_id text,
  status text not null default 'new' check (status in ('new', 'handled')),
  handled_at timestamptz,
  note text
);

create table if not exists public.visits (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  path text, source text, referrer text,
  utm_source text, utm_medium text, utm_campaign text,
  device text, lang text, session_id text
);
create index if not exists visits_created_idx on public.visits (created_at desc);
create index if not exists leads_created_idx on public.leads (created_at desc);

alter table public.leads enable row level security;
alter table public.visits enable row level security;

-- the public site may only ADD rows
drop policy if exists "site inserts leads" on public.leads;
create policy "site inserts leads" on public.leads for insert to anon with check (status = 'new' and handled_at is null);
drop policy if exists "site inserts visits" on public.visits;
create policy "site inserts visits" on public.visits for insert to anon with check (true);

-- only the studio admin may read and update
create or replace function public.is_studio_admin() returns boolean language sql stable as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'openhaim.studio@gmail.com'   -- ADMIN EMAIL
$$;
drop policy if exists "admin reads leads" on public.leads;
create policy "admin reads leads" on public.leads for select to authenticated using (public.is_studio_admin());
drop policy if exists "admin updates leads" on public.leads;
create policy "admin updates leads" on public.leads for update to authenticated using (public.is_studio_admin()) with check (public.is_studio_admin());
drop policy if exists "admin deletes leads" on public.leads;
create policy "admin deletes leads" on public.leads for delete to authenticated using (public.is_studio_admin());
drop policy if exists "admin reads visits" on public.visits;
create policy "admin reads visits" on public.visits for select to authenticated using (public.is_studio_admin());

-- live updates in the admin page
do $$ begin
  begin alter publication supabase_realtime add table public.leads; exception when duplicate_object then null; end;
  begin alter publication supabase_realtime add table public.visits; exception when duplicate_object then null; end;
end $$;

-- MVP: allow API access via anon key while RLS is on (no auth yet).
-- Run in Supabase SQL Editor if you prefer policies over SUPABASE_SERVICE_ROLE_KEY.
-- Tighten or remove before production.

alter table public.businesses enable row level security;
alter table public.customers enable row level security;
alter table public.calls enable row level security;
alter table public.call_comparisons enable row level security;

drop policy if exists mvp_anon_all on public.businesses;
create policy mvp_anon_all on public.businesses
  for all to anon using (true) with check (true);

drop policy if exists mvp_anon_all on public.customers;
create policy mvp_anon_all on public.customers
  for all to anon using (true) with check (true);

drop policy if exists mvp_anon_all on public.calls;
create policy mvp_anon_all on public.calls
  for all to anon using (true) with check (true);

drop policy if exists mvp_anon_all on public.call_comparisons;
create policy mvp_anon_all on public.call_comparisons
  for all to anon using (true) with check (true);

alter table public.calls
  add column if not exists call_sid text;

create index if not exists calls_call_sid_idx on public.calls (call_sid);

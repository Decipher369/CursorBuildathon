-- Optional agent configuration fields for My Agent page
alter table businesses add column if not exists agent_name text;
alter table businesses add column if not exists persona text;
alter table businesses add column if not exists escalation_phone text;

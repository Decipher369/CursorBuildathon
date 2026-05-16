-- Run in Supabase SQL Editor (Dashboard → SQL → New query)
alter table businesses
  add column if not exists twilio_phone_number text;

create unique index if not exists businesses_twilio_phone_number_key
  on businesses (twilio_phone_number)
  where twilio_phone_number is not null;

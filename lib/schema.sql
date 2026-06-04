-- Run this in Supabase SQL editor to set up the TRAM database

create table if not exists assessments (
  id uuid primary key default gen_random_uuid(),
  clinician_email text not null,
  yp_token text not null unique default gen_random_uuid()::text,
  parent_token text not null unique default gen_random_uuid()::text,
  report_token text not null unique default gen_random_uuid()::text,
  clinician_submitted boolean default false,
  yp_submitted boolean default false,
  parent_submitted boolean default false,
  created_at timestamptz default now()
);

create table if not exists responses (
  id uuid primary key default gen_random_uuid(),
  assessment_id uuid references assessments(id) on delete cascade,
  respondent_type text not null check (respondent_type in ('clinician','yp','parent')),
  data jsonb not null,
  submitted_at timestamptz default now(),
  unique(assessment_id, respondent_type)
);

-- Allow anonymous reads/writes (no auth required for this app)
alter table assessments enable row level security;
alter table responses enable row level security;

create policy "allow all assessments" on assessments for all using (true) with check (true);
create policy "allow all responses" on responses for all using (true) with check (true);

-- Im Supabase-Dashboard unter SQL Editor ausführen.

create table applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz default now(),
  name text not null,
  email text not null,
  studiengang text,
  semester int,
  motivation text not null,
  cv_path text,                      -- Pfad im Storage-Bucket "cvs"
  consent_privacy boolean not null,
  interests text[] default '{}'
);

alter table applications enable row level security;

-- Bewerber (anonym) dürfen nur einfügen
create policy "anon insert" on applications
  for insert to anon with check (true);

-- Eingeloggte Recruiter dürfen lesen
create policy "recruiter read" on applications
  for select to authenticated using (true);

-- Recruiter-Ansicht: nur CV und Motivation
create view recruiter_view with (security_invoker = true) as
  select id, created_at, motivation, cv_path from applications;

-- Storage: privater Bucket für Lebensläufe
insert into storage.buckets (id, name, public)
values ('cvs', 'cvs', false)
on conflict (id) do nothing;

create policy "anon upload cv" on storage.objects
  for insert to anon with check (bucket_id = 'cvs');

create policy "recruiter read cv" on storage.objects
  for select to authenticated using (bucket_id = 'cvs');

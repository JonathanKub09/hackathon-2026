-- Bewerbungs-App: Schema, Rechte, Kürzel, Zuweisung, Bewertung und Ranking.
-- Grundregel: Personendaten liegen allein in applications_private (nur Admins).

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to authenticated, service_role;

create type public.staff_role as enum ('screener', 'admin');

-- Tabellen ------------------------------------------------------------------

create table public.staff (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role public.staff_role not null default 'screener',
  display_name text not null,
  created_at timestamptz not null default now()
);

create table public.question_groups (
  slug text primary key,
  name text not null,
  keywords text[] not null default '{}',
  position smallint not null default 0
);

create table public.questions (
  id uuid primary key default gen_random_uuid(),
  group_slug text not null references public.question_groups (slug) on update cascade on delete cascade,
  position smallint not null check (position between 1 and 3),
  text text not null,
  max_length integer not null default 800,
  unique (group_slug, position)
);

create table public.rating_criteria (
  id text primary key,
  label text not null,
  description text not null default '',
  weight numeric(4, 3) not null check (weight > 0),
  position smallint not null default 0,
  is_active boolean not null default true
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  group_slug text not null references public.question_groups (slug) on update cascade,
  cv_path text not null,
  skills text[] not null default '{}',
  languages text[] not null default '{}',
  created_at timestamptz not null default now()
);

create table public.applications_private (
  application_id uuid primary key references public.applications (id) on delete cascade,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text not null,
  demographics jsonb not null default '{}',
  consent_privacy boolean not null check (consent_privacy),
  created_at timestamptz not null default now()
);

create table public.experiences (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  position smallint not null default 0,
  start_date text not null,
  end_date text not null,
  title text not null,
  organization text not null,
  details text[] not null default '{}',
  is_relevant boolean not null default false
);

create table public.educations (
  id uuid primary key default gen_random_uuid(),
  application_id uuid not null references public.applications (id) on delete cascade,
  position smallint not null default 0,
  start_date text not null,
  end_date text not null,
  title text not null,
  organization text not null
);

create table public.answers (
  application_id uuid not null references public.applications (id) on delete cascade,
  question_id uuid not null references public.questions (id),
  answer text not null,
  primary key (application_id, question_id)
);

create table public.screening_assignments (
  application_id uuid not null references public.applications (id) on delete cascade,
  screener_id uuid not null references public.staff (user_id) on delete cascade,
  assigned_at timestamptz not null default now(),
  completed_at timestamptz,
  comment text,
  primary key (application_id, screener_id)
);

create table public.ratings (
  application_id uuid not null,
  screener_id uuid not null,
  criterion_id text not null references public.rating_criteria (id),
  score smallint not null check (score between 1 and 5),
  primary key (application_id, screener_id, criterion_id),
  foreign key (application_id, screener_id)
    references public.screening_assignments (application_id, screener_id) on delete cascade
);

create index on public.applications (group_slug);
create index on public.experiences (application_id);
create index on public.educations (application_id);
create index on public.answers (question_id);
create index on public.screening_assignments (screener_id);
create index on public.ratings (criterion_id);

-- Hilfsfunktionen für die Rechte --------------------------------------------

create function private.required_screeners() returns integer
language sql immutable set search_path = '' as $$ select 4 $$;

create function private.is_staff() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (select 1 from public.staff where user_id = (select auth.uid()))
$$;

create function private.is_admin() returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.staff
    where user_id = (select auth.uid()) and role = 'admin'
  )
$$;

create function private.is_fully_screened(app uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select count(*) >= private.required_screeners()
  from public.screening_assignments
  where application_id = app and completed_at is not null
$$;

-- Admins sehen alles. Screener sehen ihre Zuweisungen und fertig bewertete Bewerbungen.
create function private.can_view_application(app uuid) returns boolean
language sql stable security definer set search_path = '' as $$
  select private.is_admin()
    or exists (
      select 1 from public.screening_assignments
      where application_id = app and screener_id = (select auth.uid())
    )
    or (private.is_staff() and private.is_fully_screened(app))
$$;

create function private.can_view_cv(path text) returns boolean
language sql stable security definer set search_path = '' as $$
  select exists (
    select 1 from public.applications a
    where a.cv_path = path and private.can_view_application(a.id)
  )
$$;

revoke all on all functions in schema private from public;
grant execute on all functions in schema private to authenticated, service_role;

-- Kürzel: 2 Buchstaben Vorname + 2 Buchstaben Nachname + 4 Ziffern Telefon ---

create function private.make_code(first_name text, last_name text, phone text) returns text
language plpgsql immutable set search_path = '' as $$
declare
  f text := upper(regexp_replace(first_name, '[\s''.-]', '', 'g'));
  l text := upper(regexp_replace(last_name, '[\s''.-]', '', 'g'));
  p text := regexp_replace(phone, '\D', '', 'g');
begin
  if length(f) = 0 or length(l) = 0 or length(p) < 4 then
    raise exception 'Name oder Telefonnummer reichen für das Kürzel nicht aus';
  end if;
  return left(f, 2) || right(l, 2) || right(p, 4);
end
$$;

-- Zuweisung: Jede Bewerbung bekommt 4 Screener, die mit der wenigsten offenen Arbeit zuerst.

create function private.assign_open_applications() returns void
language plpgsql security definer set search_path = '' as $$
declare
  app record;
begin
  perform pg_advisory_xact_lock(hashtext('assign_open_applications'));
  for app in
    select a.id, private.required_screeners() - count(sa.screener_id) as missing
    from public.applications a
    left join public.screening_assignments sa on sa.application_id = a.id
    group by a.id
    having count(sa.screener_id) < private.required_screeners()
    order by min(a.created_at)
  loop
    insert into public.screening_assignments (application_id, screener_id)
    select app.id, s.user_id
    from public.staff s
    where s.role = 'screener'
      and not exists (
        select 1 from public.screening_assignments x
        where x.application_id = app.id and x.screener_id = s.user_id
      )
    order by (
      select count(*) from public.screening_assignments o
      where o.screener_id = s.user_id and o.completed_at is null
    ), random()
    limit app.missing;
  end loop;
end
$$;

create function private.on_staff_change() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  perform private.assign_open_applications();
  return null;
end
$$;

create trigger staff_assign_open
after insert or update or delete on public.staff
for each statement execute function private.on_staff_change();

-- Bewerbung anlegen: Nur die Edge Function darf das (service_role) -----------

create function public.create_application(p jsonb) returns text
language plpgsql security definer set search_path = '' as $$
declare
  base_code text := private.make_code(p ->> 'first_name', p ->> 'last_name', p ->> 'phone');
  new_code text := base_code;
  suffix integer := 1;
  app_id uuid := gen_random_uuid();
  question_count integer;
begin
  if coalesce((p ->> 'consent_privacy')::boolean, false) is not true then
    raise exception 'Die Datenschutz-Einwilligung fehlt';
  end if;

  select count(*) into question_count
  from jsonb_array_elements(coalesce(p -> 'answers', '[]')) x
  join public.questions q
    on q.id = (x ->> 'question_id')::uuid and q.group_slug = p ->> 'group_slug'
  where length(trim(x ->> 'answer')) > 0;

  if question_count <> (select count(*) from public.questions where group_slug = p ->> 'group_slug')
     or question_count = 0 then
    raise exception 'Es müssen alle Fragen der Gruppe beantwortet sein';
  end if;

  while exists (select 1 from public.applications where code = new_code) loop
    suffix := suffix + 1;
    new_code := base_code || '-' || suffix;
  end loop;

  insert into public.applications (id, code, group_slug, cv_path, skills, languages)
  values (
    app_id, new_code, p ->> 'group_slug', p ->> 'cv_path',
    array(select jsonb_array_elements_text(coalesce(p -> 'skills', '[]'))),
    array(select jsonb_array_elements_text(coalesce(p -> 'languages', '[]')))
  );

  insert into public.applications_private
    (application_id, first_name, last_name, email, phone, demographics, consent_privacy)
  values (
    app_id, p ->> 'first_name', p ->> 'last_name', p ->> 'email', p ->> 'phone',
    coalesce(p -> 'demographics', '{}'), true
  );

  insert into public.experiences
    (application_id, position, start_date, end_date, title, organization, details, is_relevant)
  select
    app_id, (e.ord - 1)::smallint, e.item ->> 'start_date', e.item ->> 'end_date',
    e.item ->> 'title', e.item ->> 'organization',
    array(select jsonb_array_elements_text(coalesce(e.item -> 'details', '[]'))),
    coalesce((e.item ->> 'is_relevant')::boolean, false)
  from jsonb_array_elements(coalesce(p -> 'experiences', '[]')) with ordinality e(item, ord);

  insert into public.educations
    (application_id, position, start_date, end_date, title, organization)
  select
    app_id, (e.ord - 1)::smallint, e.item ->> 'start_date', e.item ->> 'end_date',
    e.item ->> 'title', e.item ->> 'organization'
  from jsonb_array_elements(coalesce(p -> 'educations', '[]')) with ordinality e(item, ord);

  insert into public.answers (application_id, question_id, answer)
  select app_id, (x ->> 'question_id')::uuid, x ->> 'answer'
  from jsonb_array_elements(p -> 'answers') x;

  perform private.assign_open_applications();
  return new_code;
end
$$;

-- Bewertung abgeben: alle aktiven Kriterien auf einmal, danach gesperrt ------

create function public.submit_rating(
  p_application_id uuid,
  p_scores jsonb,
  p_comment text default null
) returns void
language plpgsql security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  done_at timestamptz;
begin
  select completed_at into done_at
  from public.screening_assignments
  where application_id = p_application_id and screener_id = uid
  for update;

  if not found then
    raise exception 'Diese Bewerbung ist dir nicht zugewiesen';
  end if;
  if done_at is not null then
    raise exception 'Diese Bewerbung hast du schon bewertet';
  end if;
  if exists (
    select 1 from public.rating_criteria c
    where c.is_active and not (p_scores ? c.id)
  ) then
    raise exception 'Es müssen alle Kriterien bewertet sein';
  end if;

  insert into public.ratings (application_id, screener_id, criterion_id, score)
  select p_application_id, uid, c.id, (p_scores ->> c.id)::smallint
  from public.rating_criteria c
  where c.is_active;

  update public.screening_assignments
  set completed_at = now(), comment = p_comment
  where application_id = p_application_id and screener_id = uid;
end
$$;

-- Fortschritt fürs Dashboard: nur Zahlen, keine Inhalte ----------------------

create function public.get_screening_progress() returns jsonb
language plpgsql stable security definer set search_path = '' as $$
declare
  uid uuid := (select auth.uid());
  result jsonb;
begin
  if not private.is_staff() then
    raise exception 'Kein Zugriff';
  end if;

  select jsonb_build_object(
    'applications_total', (select count(*) from public.applications),
    'applications_done', (
      select count(*) from public.applications a where private.is_fully_screened(a.id)
    ),
    'reviews_done', (select count(*) from public.screening_assignments where completed_at is not null),
    'reviews_total', (select count(*) * private.required_screeners() from public.applications),
    'my_open', (
      select count(*) from public.screening_assignments
      where screener_id = uid and completed_at is null
    ),
    'my_done', (
      select count(*) from public.screening_assignments
      where screener_id = uid and completed_at is not null
    )
  ) into result;

  if private.is_admin() then
    result := result || jsonb_build_object('screeners', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'name', s.display_name,
        'done', (select count(*) from public.screening_assignments x
                 where x.screener_id = s.user_id and x.completed_at is not null),
        'open', (select count(*) from public.screening_assignments x
                 where x.screener_id = s.user_id and x.completed_at is null)
      ) order by s.display_name), '[]')
      from public.staff s where s.role = 'screener'
    ));
  end if;

  return result;
end
$$;

revoke all on function public.create_application(jsonb) from public, anon, authenticated;
grant execute on function public.create_application(jsonb) to service_role;
revoke all on function public.submit_rating(uuid, jsonb, text) from public, anon;
grant execute on function public.submit_rating(uuid, jsonb, text) to authenticated;
revoke all on function public.get_screening_progress() from public, anon;
grant execute on function public.get_screening_progress() to authenticated;

-- Ansichten: Alle laufen mit den Rechten der aufrufenden Person --------------

-- Eigene Warteschlange der Screener
create view public.recruiter_view with (security_invoker = true) as
select
  a.id, a.code, a.created_at, a.group_slug, a.cv_path, a.skills, a.languages,
  sa.assigned_at, sa.completed_at
from public.applications a
join public.screening_assignments sa on sa.application_id = a.id
where sa.screener_id = (select auth.uid());

-- Gewichtetes Ergebnis je Screener
create view public.screener_scores with (security_invoker = true) as
select
  r.application_id,
  r.screener_id,
  round(sum(r.score * c.weight) / sum(c.weight), 3) as weighted_score
from public.ratings r
join public.rating_criteria c on c.id = r.criterion_id
group by r.application_id, r.screener_id;

-- Einzelne Einschätzungen für die Detailansicht
create view public.screening_reviews with (security_invoker = true) as
select
  sa.application_id,
  s.display_name as screener_name,
  ss.weighted_score,
  sa.comment,
  sa.completed_at,
  (
    select jsonb_object_agg(r.criterion_id, r.score)
    from public.ratings r
    where r.application_id = sa.application_id and r.screener_id = sa.screener_id
  ) as scores
from public.screening_assignments sa
join public.staff s on s.user_id = sa.screener_id
join public.screener_scores ss
  on ss.application_id = sa.application_id and ss.screener_id = sa.screener_id
where sa.completed_at is not null;

-- Ranking: Schnitt der 4 Screener, nur fertig bewertete Bewerbungen
create view public.ranking with (security_invoker = true) as
select
  rank() over (order by avg(ss.weighted_score) desc)::integer as rank,
  a.id as application_id,
  a.code,
  a.group_slug,
  round(avg(ss.weighted_score), 2) as score,
  count(*)::integer as screener_count,
  a.created_at
from public.applications a
join public.screener_scores ss on ss.application_id = a.id
group by a.id
having count(*) >= private.required_screeners();

-- Ranking mit Kontaktdaten: Für Screener leer, weil die Tabelle nur Admins zeigt
create view public.ranking_admin with (security_invoker = true) as
select
  r.*,
  p.first_name,
  p.last_name,
  p.email,
  p.phone,
  p.demographics
from public.ranking r
join public.applications_private p on p.application_id = r.application_id;

-- Rechte --------------------------------------------------------------------

alter table public.staff enable row level security;
alter table public.question_groups enable row level security;
alter table public.questions enable row level security;
alter table public.rating_criteria enable row level security;
alter table public.applications enable row level security;
alter table public.applications_private enable row level security;
alter table public.experiences enable row level security;
alter table public.educations enable row level security;
alter table public.answers enable row level security;
alter table public.screening_assignments enable row level security;
alter table public.ratings enable row level security;

revoke all on all tables in schema public from anon, authenticated;
grant select on public.question_groups, public.questions to anon;
grant select on all tables in schema public to authenticated;
grant insert, update, delete on
  public.staff, public.question_groups, public.questions, public.rating_criteria
  to authenticated;

create policy "staff lesen staff" on public.staff
  for select to authenticated using ((select private.is_staff()));
create policy "admins verwalten staff" on public.staff
  for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

create policy "alle lesen gruppen" on public.question_groups
  for select to anon, authenticated using (true);
create policy "admins verwalten gruppen" on public.question_groups
  for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

create policy "alle lesen fragen" on public.questions
  for select to anon, authenticated using (true);
create policy "admins verwalten fragen" on public.questions
  for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

create policy "staff liest kriterien" on public.rating_criteria
  for select to authenticated using ((select private.is_staff()));
create policy "admins verwalten kriterien" on public.rating_criteria
  for all to authenticated
  using ((select private.is_admin())) with check ((select private.is_admin()));

create policy "bewerbungen je nach zuweisung" on public.applications
  for select to authenticated using (private.can_view_application(id));

create policy "personendaten nur fuer admins" on public.applications_private
  for select to authenticated using ((select private.is_admin()));

create policy "stationen je nach zuweisung" on public.experiences
  for select to authenticated using (private.can_view_application(application_id));

create policy "ausbildung je nach zuweisung" on public.educations
  for select to authenticated using (private.can_view_application(application_id));

create policy "antworten je nach zuweisung" on public.answers
  for select to authenticated using (private.can_view_application(application_id));

create policy "zuweisungen eigene oder fertige" on public.screening_assignments
  for select to authenticated using (
    screener_id = (select auth.uid())
    or (select private.is_admin())
    or ((select private.is_staff()) and private.is_fully_screened(application_id))
  );

-- Fremde Bewertungen bleiben verborgen, bis alle 4 fertig sind
create policy "bewertungen eigene oder fertige" on public.ratings
  for select to authenticated using (
    screener_id = (select auth.uid())
    or (select private.is_admin())
    or ((select private.is_staff()) and private.is_fully_screened(application_id))
  );

-- Lebensläufe: privat, Upload nur über die Edge Function --------------------

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('cvs', 'cvs', false, 5242880, array['application/pdf'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy "lebenslauf je nach zuweisung" on storage.objects
  for select to authenticated
  using (bucket_id = 'cvs' and private.can_view_cv(name));

-- Startdaten: Platzhalter, bis die Konzeption die echten Inhalte festlegt ----

insert into public.question_groups (slug, name, keywords, position) values
  ('technik', 'Technik',
   array['Ingenieur', 'Maschinenbau', 'Konstruktion', 'CAD', 'Informatik', 'Elektrotechnik', 'Technische Mechanik'], 1),
  ('kreativ', 'Kreativ',
   array['Kunst', 'Grafikdesign', 'Grafikdesigner', 'Kommunikationsdesign', 'Illustration', 'Typografie'], 2),
  ('generisch', 'Allgemein', '{}', 3);

insert into public.questions (group_slug, position, text) values
  ('technik', 1, 'Welches technische Problem hast du zuletzt gelöst, und wie bist du vorgegangen?'),
  ('technik', 2, 'Wie erklärst du einen technischen Sachverhalt jemandem ohne Fachwissen?'),
  ('technik', 3, 'Warum möchtest du dein technisches Wissen in der Beratung einsetzen?'),
  ('kreativ', 1, 'Welches deiner Projekte zeigt deine Arbeitsweise am besten, und warum?'),
  ('kreativ', 2, 'Wie gehst du mit Feedback um, das deiner Idee widerspricht?'),
  ('kreativ', 3, 'Warum möchtest du deine kreative Perspektive in der Beratung einsetzen?'),
  ('generisch', 1, 'Auf welche Leistung der letzten Jahre bist du besonders stolz?'),
  ('generisch', 2, 'Beschreibe eine Situation, in der du Verantwortung übernommen hast.'),
  ('generisch', 3, 'Warum möchtest du bei uns mitarbeiten?');

insert into public.rating_criteria (id, label, description, weight, position) values
  ('motivation', 'Motivation', 'Wie überzeugend ist die Motivation?', 0.300, 1),
  ('fachlich', 'Fachliche Eignung', 'Passen Wissen und Ausbildung?', 0.300, 2),
  ('erfahrung', 'Erfahrung', 'Wie relevant sind die Stationen?', 0.250, 3),
  ('kommunikation', 'Kommunikation', 'Wie klar sind die Antworten?', 0.150, 4);

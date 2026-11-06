-- Was die Frontends brauchen: Interview, Wunschtermin, Semester, Bewerberprofil,
-- Bewertungsrubrik mit Skala 1 bis 4 und Übersichten für Kanban und Auswertung.

alter type public.application_status add value if not exists 'interview' before 'accepted';

drop view public.ranking_admin;
drop view public.ranking;
drop view public.recruiter_view;

alter table public.applications
  add column semester smallint,
  add column preferred_slot text,
  add column interview_at timestamptz;

alter table public.applications_private
  add column keep_data boolean not null default false,
  add column access_token uuid not null default gen_random_uuid() unique;

-- Bewertung: Rubrik aus der Screener-Ansicht, Gewichte sind Platzhalter
delete from public.ratings;
delete from public.rating_criteria;

alter table public.rating_criteria
  add column basis text not null default '',
  add column levels text[] not null default '{}';

alter table public.ratings drop constraint ratings_score_check;
alter table public.ratings add constraint ratings_score_check check (score between 1 and 4);

insert into public.rating_criteria (id, label, basis, weight, position, levels) values
  ('motivation', 'Motivation', 'Antwort auf Frage 1', 0.300, 1, array[
    'Allgemein, kein Bezug zu uns oder zur Trainee-Zeit.',
    'Nachvollziehbar, aber austauschbar.',
    'Konkret, mit eigenem Beispiel.',
    'Konkret, mit eigenem Beispiel und klarer Vorstellung von der Trainee-Zeit.']),
  ('fachfrage', 'Fachfrage', 'Antwort auf Frage 2', 0.300, 2, array[
    'Kein strukturiertes Vorgehen erkennbar.',
    'Vorgehen erkennbar, Ergebnis bleibt unklar.',
    'Strukturiertes Vorgehen mit nachvollziehbarem Ergebnis.',
    'Strukturiert, Ergebnis belegt, eigene Rolle klar benannt.']),
  ('erfahrung', 'Berufserfahrung', 'Stationen aus dem Lebenslauf', 0.250, 3, array[
    'Keine relevante Erfahrung.',
    'Nebenjob, Ehrenamt oder Hochschulgruppe.',
    'Praktikum oder Werkstudium mit Bezug zu Beratung.',
    'Mehrere relevante Stationen oder echte Verantwortung (Team, Budget).']),
  ('skills', 'Skills', 'Aufgelistete Skills und Sprachen', 0.150, 4, array[
    'Kaum Skills, die in Projekten helfen.',
    'Einzelne passende Skills.',
    'Mehrere passende Skills, teils durch Erfahrung belegt.',
    'Breites Profil, durch Erfahrung belegt.']);

-- Fragen: Platzhalter aus der Bewerber-Strecke, die echten kommen noch
update public.questions set text = 'Warum möchtest du bei uns mitmachen?' where position = 1;
update public.questions set text = 'Welche Methode oder welches Wissen aus deinem Studium würdest du in ein Beratungsprojekt mitbringen, und wofür?' where position = 2;
update public.questions set text = 'Welche Entscheidung würdest du heute anders treffen, und was hast du daraus gelernt?' where position = 3;

create function private.review_count(app uuid) returns integer
language sql stable security definer set search_path = '' as $$
  select count(*)::integer
  from public.screening_assignments
  where application_id = app and completed_at is not null
$$;

revoke all on function private.review_count(uuid) from public;
grant execute on function private.review_count(uuid) to authenticated, service_role;

-- Bewerbung anlegen gibt jetzt zusätzlich den Zugang zum Bewerberprofil zurück
drop function public.create_application(jsonb);

create function public.create_application(p jsonb) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  base_code text := private.make_code(p ->> 'first_name', p ->> 'last_name', p ->> 'phone');
  new_code text := base_code;
  suffix integer := 1;
  app_id uuid := gen_random_uuid();
  question_count integer;
  token uuid;
begin
  if coalesce((p ->> 'consent_privacy')::boolean, false) is not true then
    raise exception 'Die Datenschutz-Einwilligung fehlt';
  end if;

  select count(*) into question_count
  from jsonb_array_elements(coalesce(p -> 'answers', '[]')) x
  join public.questions q on q.id = (x ->> 'question_id')::uuid
  where length(trim(x ->> 'answer')) > 0;

  if question_count <> (select count(*) from public.questions) or question_count = 0 then
    raise exception 'Es müssen alle Fragen beantwortet sein';
  end if;

  while exists (select 1 from public.applications where code = new_code) loop
    suffix := suffix + 1;
    new_code := base_code || '-' || suffix;
  end loop;

  insert into public.applications (
    id, code, skills, languages, study_program, degree, university,
    expected_graduation, semester, preferred_slot
  )
  values (
    app_id, new_code,
    array(select jsonb_array_elements_text(coalesce(p -> 'skills', '[]'))),
    array(select jsonb_array_elements_text(coalesce(p -> 'languages', '[]'))),
    nullif(trim(p ->> 'study_program'), ''),
    nullif(trim(p ->> 'degree'), ''),
    nullif(trim(p ->> 'university'), ''),
    nullif(trim(p ->> 'expected_graduation'), ''),
    case when p ->> 'semester' ~ '^\d{1,2}$' then (p ->> 'semester')::smallint end,
    nullif(trim(p ->> 'preferred_slot'), '')
  );

  insert into public.applications_private (
    application_id, first_name, last_name, email, phone, demographics,
    consent_privacy, cv_path, keep_data
  )
  values (
    app_id, p ->> 'first_name', p ->> 'last_name', p ->> 'email', p ->> 'phone',
    coalesce(p -> 'demographics', '{}'), true, p ->> 'cv_path',
    coalesce((p ->> 'keep_data')::boolean, false)
  )
  returning access_token into token;

  insert into public.experiences
    (application_id, position, start_date, end_date, title, organization, details, is_relevant)
  select
    app_id, (e.ord - 1)::smallint, coalesce(e.item ->> 'start_date', ''), coalesce(e.item ->> 'end_date', ''),
    coalesce(e.item ->> 'title', ''), coalesce(e.item ->> 'organization', ''),
    array(select jsonb_array_elements_text(coalesce(e.item -> 'details', '[]'))),
    coalesce((e.item ->> 'is_relevant')::boolean, false)
  from jsonb_array_elements(coalesce(p -> 'experiences', '[]')) with ordinality e(item, ord);

  insert into public.educations
    (application_id, position, start_date, end_date, title, organization)
  select
    app_id, (e.ord - 1)::smallint, coalesce(e.item ->> 'start_date', ''), coalesce(e.item ->> 'end_date', ''),
    coalesce(e.item ->> 'title', ''), coalesce(e.item ->> 'organization', '')
  from jsonb_array_elements(coalesce(p -> 'educations', '[]')) with ordinality e(item, ord);

  insert into public.answers (application_id, question_id, answer)
  select app_id, (x ->> 'question_id')::uuid, x ->> 'answer'
  from jsonb_array_elements(p -> 'answers') x;

  perform private.assign_open_applications();
  return jsonb_build_object('code', new_code, 'token', token);
end
$$;

revoke all on function public.create_application(jsonb) from public, anon, authenticated;
grant execute on function public.create_application(jsonb) to service_role;

-- Bewerberprofil: nur über die Edge Function, nur mit dem persönlichen Zugang
create function public.get_application_status(p_token uuid) returns jsonb
language sql stable security definer set search_path = '' as $$
  select jsonb_build_object(
    'code', a.code,
    'status', a.status,
    'created_at', a.created_at,
    'first_name', p.first_name,
    'preferred_slot', a.preferred_slot,
    'interview_at', a.interview_at
  )
  from public.applications_private p
  join public.applications a on a.id = p.application_id
  where p.access_token = p_token
$$;

revoke all on function public.get_application_status(uuid) from public, anon, authenticated;
grant execute on function public.get_application_status(uuid) to service_role;

-- Verschieben im Ranking, beim Interview optional mit Termin
drop function public.set_application_status(uuid, public.application_status);

create function public.set_application_status(
  p_application_id uuid,
  p_status public.application_status,
  p_interview_at timestamptz default null
) returns void
language plpgsql security definer set search_path = '' as $$
begin
  if not private.is_admin() then
    raise exception 'Nur Admins dürfen den Status ändern';
  end if;
  if p_status = 'not_rated' then
    raise exception 'Dieser Status wird automatisch gesetzt';
  end if;
  if not private.is_fully_screened(p_application_id) then
    raise exception 'Die Bewerbung ist noch nicht fertig bewertet';
  end if;

  update public.applications
  set status = p_status,
      interview_at = coalesce(p_interview_at, interview_at)
  where id = p_application_id;
end
$$;

revoke all on function public.set_application_status(uuid, public.application_status, timestamptz) from public, anon;
grant execute on function public.set_application_status(uuid, public.application_status, timestamptz) to authenticated;

-- Ansichten ------------------------------------------------------------------

create view public.recruiter_view with (security_invoker = true) as
select
  a.id, a.code, a.created_at, a.status, a.skills, a.languages,
  a.study_program, a.degree, a.university, a.semester, a.expected_graduation,
  a.preferred_slot, a.interview_at,
  sa.assigned_at, sa.completed_at
from public.applications a
join public.screening_assignments sa on sa.application_id = a.id
where sa.screener_id = (select auth.uid());

create view public.ranking with (security_invoker = true) as
select
  rank() over (order by avg(ss.weighted_score) desc)::integer as rank,
  a.id as application_id,
  a.code,
  a.status,
  a.study_program,
  a.degree,
  a.semester,
  a.expected_graduation,
  a.interview_at,
  round(avg(ss.weighted_score), 2) as score,
  count(*)::integer as screener_count,
  (
    select jsonb_object_agg(x.criterion_id, x.average)
    from (
      select r.criterion_id, round(avg(r.score), 2) as average
      from public.ratings r
      where r.application_id = a.id
      group by r.criterion_id
    ) x
  ) as criterion_scores,
  a.created_at
from public.applications a
join public.screener_scores ss on ss.application_id = a.id
group by a.id
having count(*) >= private.required_screeners();

create view public.ranking_admin with (security_invoker = true) as
select
  r.*,
  p.first_name,
  p.last_name,
  p.email,
  p.phone,
  p.demographics,
  p.cv_path,
  p.keep_data
from public.ranking r
join public.applications_private p on p.application_id = r.application_id;

-- Alles, was die Person sehen darf, auch noch nicht fertig bewertete Bewerbungen
create view public.application_overview with (security_invoker = true) as
select
  a.id, a.code, a.created_at, a.status, a.skills, a.languages,
  a.study_program, a.degree, a.university, a.semester, a.expected_graduation,
  a.preferred_slot, a.interview_at,
  private.review_count(a.id) as reviews_done,
  private.required_screeners() as reviews_required,
  sa.application_id is not null as is_assigned,
  sa.completed_at as my_completed_at,
  r.rank,
  r.score,
  r.criterion_scores
from public.applications a
left join public.screening_assignments sa
  on sa.application_id = a.id and sa.screener_id = (select auth.uid())
left join public.ranking r on r.application_id = a.id;

-- Wie oben mit Personendaten, für Screener leer
create view public.admin_overview with (security_invoker = true) as
select
  o.*,
  p.first_name,
  p.last_name,
  p.email,
  p.phone,
  p.demographics,
  p.cv_path,
  p.keep_data
from public.application_overview o
join public.applications_private p on p.application_id = o.id;

revoke all on public.recruiter_view, public.ranking, public.ranking_admin,
  public.application_overview, public.admin_overview from anon;
grant select on public.recruiter_view, public.ranking, public.ranking_admin,
  public.application_overview, public.admin_overview to authenticated;

-- Pivot: 3 feste Fragen statt Gruppen. Studienprofil für Screener aus dem Lebenslauf.

drop view public.ranking_admin;
drop view public.ranking;
drop view public.recruiter_view;

-- Vorhandene Antworten auf die festen Fragen umhängen
update public.answers a
set question_id = fixed.id
from public.questions old, public.questions fixed
where a.question_id = old.id
  and old.group_slug <> 'generisch'
  and fixed.group_slug = 'generisch'
  and fixed.position = old.position;

delete from public.questions where group_slug <> 'generisch';
alter table public.questions drop column group_slug;
alter table public.questions add constraint questions_position_key unique (position);

alter table public.applications drop column group_slug;
alter table public.applications
  add column study_program text,
  add column degree text,
  add column university text,
  add column expected_graduation text;

drop table public.question_groups;

create or replace function public.create_application(p jsonb) returns text
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
  join public.questions q on q.id = (x ->> 'question_id')::uuid
  where length(trim(x ->> 'answer')) > 0;

  if question_count <> (select count(*) from public.questions) or question_count = 0 then
    raise exception 'Es müssen alle Fragen beantwortet sein';
  end if;

  while exists (select 1 from public.applications where code = new_code) loop
    suffix := suffix + 1;
    new_code := base_code || '-' || suffix;
  end loop;

  insert into public.applications
    (id, code, cv_path, skills, languages, study_program, degree, university, expected_graduation)
  values (
    app_id, new_code, p ->> 'cv_path',
    array(select jsonb_array_elements_text(coalesce(p -> 'skills', '[]'))),
    array(select jsonb_array_elements_text(coalesce(p -> 'languages', '[]'))),
    nullif(trim(p ->> 'study_program'), ''),
    nullif(trim(p ->> 'degree'), ''),
    nullif(trim(p ->> 'university'), ''),
    nullif(trim(p ->> 'expected_graduation'), '')
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

create view public.recruiter_view with (security_invoker = true) as
select
  a.id, a.code, a.created_at, a.cv_path, a.skills, a.languages,
  a.study_program, a.degree, a.university, a.expected_graduation,
  sa.assigned_at, sa.completed_at
from public.applications a
join public.screening_assignments sa on sa.application_id = a.id
where sa.screener_id = (select auth.uid());

create view public.ranking with (security_invoker = true) as
select
  rank() over (order by avg(ss.weighted_score) desc)::integer as rank,
  a.id as application_id,
  a.code,
  a.study_program,
  a.degree,
  a.expected_graduation,
  round(avg(ss.weighted_score), 2) as score,
  count(*)::integer as screener_count,
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
  p.demographics
from public.ranking r
join public.applications_private p on p.application_id = r.application_id;

revoke all on public.recruiter_view, public.ranking, public.ranking_admin from anon;
grant select on public.recruiter_view, public.ranking, public.ranking_admin to authenticated;

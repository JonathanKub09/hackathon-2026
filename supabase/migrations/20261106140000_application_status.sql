-- Status je Bewerbung: nicht bewertet, bewertet, abgelehnt, angenommen.

create type public.application_status as enum ('not_rated', 'rated', 'rejected', 'accepted');

drop view public.ranking_admin;
drop view public.ranking;
drop view public.recruiter_view;

alter table public.applications
  add column status public.application_status not null default 'not_rated';

create index on public.applications (status);

create view public.recruiter_view with (security_invoker = true) as
select
  a.id, a.code, a.created_at, a.status, a.cv_path, a.skills, a.languages,
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
  a.status,
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

-- Die vierte Bewertung setzt den Status automatisch auf bewertet
create or replace function public.submit_rating(
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

  if private.is_fully_screened(p_application_id) then
    update public.applications
    set status = 'rated'
    where id = p_application_id and status = 'not_rated';
  end if;
end
$$;

-- Verschieben im Ranking: nur Admins, nur fertig bewertete Bewerbungen
create function public.set_application_status(
  p_application_id uuid,
  p_status public.application_status
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

  update public.applications set status = p_status where id = p_application_id;
end
$$;

revoke all on function public.set_application_status(uuid, public.application_status) from public, anon;
grant execute on function public.set_application_status(uuid, public.application_status) to authenticated;

create or replace function public.get_screening_progress() returns jsonb
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
    ),
    'not_rated', (select count(*) from public.applications where status = 'not_rated'),
    'rated', (select count(*) from public.applications where status = 'rated'),
    'rejected', (select count(*) from public.applications where status = 'rejected'),
    'accepted', (select count(*) from public.applications where status = 'accepted')
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

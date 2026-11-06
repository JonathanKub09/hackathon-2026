-- Demo-Screener füllen das Ranking mit Bewertungen, bekommen aber keine neuen Zuweisungen.
-- So bleiben offene Plätze für die echten Screener frei.

alter table public.staff add column is_demo boolean not null default false;

create or replace function private.assign_open_applications() returns void
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
      and not s.is_demo
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

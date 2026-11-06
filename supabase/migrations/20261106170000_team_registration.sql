-- Registrierung in der App: Der Einladungscode entscheidet über die Rolle.
-- Gespeichert wird nur der Hash, die Tabelle liegt außerhalb der öffentlichen API.

create table private.invite_codes (
  code_hash text primary key,
  role public.staff_role not null,
  created_at timestamptz not null default now()
);

revoke all on private.invite_codes from public, anon, authenticated;

create function public.invite_role(p_code text) returns public.staff_role
language sql stable security definer set search_path = '' as $$
  select role
  from private.invite_codes
  where code_hash = encode(sha256(convert_to(trim(p_code), 'UTF8')), 'hex')
$$;

revoke all on function public.invite_role(text) from public, anon, authenticated;
grant execute on function public.invite_role(text) to service_role;

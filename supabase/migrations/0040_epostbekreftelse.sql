create table if not exists public.epostbekreftelser (
  user_id uuid primary key references auth.users(id) on delete cascade,
  token_hash text,
  utloper timestamptz,
  sendt timestamptz,
  bekreftet timestamptz
);

-- Ingen policyer: bare service_role (serveren) leser og skriver. Kunden skal
-- ikke kunne sette sin egen e-post som bekreftet.
alter table public.epostbekreftelser enable row level security;

-- Alle som finnes fra før regnes som bekreftet; kravet gjelder nye registreringer.
insert into public.epostbekreftelser (user_id, bekreftet)
select id, now() from auth.users
on conflict (user_id) do nothing;

-- Ingen rad = bekreftet (for eksempel brukere invitert av en administrator).
create or replace function public.epost_er_bekreftet() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select bekreftet is not null from public.epostbekreftelser where user_id = auth.uid()), true);
$$;

revoke execute on function public.epost_er_bekreftet() from public, anon;
grant execute on function public.epost_er_bekreftet() to authenticated;

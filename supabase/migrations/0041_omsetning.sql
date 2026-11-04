create table if not exists public.omsetning (
  referanse text primary key,
  kilde text not null,
  belop_ore bigint not null,
  tidspunkt timestamptz not null default now()
);
-- Bare serveren (service_role) skriver og leser. Brukes til å vokte mva-grensen på 50 000 kr.
alter table public.omsetning enable row level security;

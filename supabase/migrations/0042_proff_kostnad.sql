-- Hva Proff-oppslagene i denne kontrollen kostet oss (kr, uten mva). Bare for intern kostnadsoversikt.
alter table public.kontroller add column if not exists proff_kostnad numeric;

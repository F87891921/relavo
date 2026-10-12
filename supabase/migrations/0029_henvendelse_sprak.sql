alter table kontakt_henvendelser add column if not exists sprak text not null default 'no' check (sprak in ('no','sv','en'));

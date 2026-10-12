alter table offerter add column if not exists sprak text not null default 'no' check (sprak in ('no','sv','en'));

-- Start tilbake til 2 900, og større leverantørramme: Start 50, Vekst 150, Bygg 400.
-- Prisen per leverantør faller for hvert nivå og er alltid under enkeltkontrollen (890).
create or replace function maks_leverandorer(p_plan text)
returns integer language sql immutable as $$
  select case p_plan when 'start' then 50 when 'vekst' then 150 when 'bygg' then 400 else null end
$$;
-- lag_fakturaplan: se 0034; 'start' er 2900 igjen.

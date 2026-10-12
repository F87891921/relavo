-- Start (selskap, opptil 25 leverandører) går fra 2 900 til 2 000 per måned.
-- Kun fakturaplanen leser listeprisen i basen; resten ligger i lib/priser.ts.
create or replace function lag_fakturaplan(p_org uuid)
returns integer language plpgsql security definer set search_path = public as $$
declare o organisasjoner%rowtype; v_mnd integer; v_ar integer; v_belopp integer; v_start date; v_n integer := 0; v_rader integer;
begin
  if not er_ansatt() then raise exception 'Bare ansatte.' using errcode = '42501'; end if;
  select * into o from organisasjoner where id = p_org;
  if not found or o.betalingsmate is distinct from 'faktura' then return 0; end if;

  v_start := coalesce(o.aktivert, now())::date;

  if o.avtalt_total is not null and o.avtale_mnd is not null then
    v_ar := greatest(1, ceil(o.avtale_mnd / 12.0)::integer);
    v_belopp := round(o.avtalt_total::numeric / v_ar)::integer;
  else
    v_mnd := case o.plan
      when 'liten' then 3900 when 'kommune' then 7900 when 'medelstor' then 12900
      when 'start' then 2000 when 'vekst' then 5900 when 'bygg' then 11900
      when 'standard' then 6900 when 'enterprise' then 12900 else null end;
    if v_mnd is null then return 0; end if;
    v_ar := 1;
    v_belopp := v_mnd * 12;
  end if;

  for i in 1..v_ar loop
    insert into fakturaplan (organisasjon_id, aar, forfaller, belopp)
    values (p_org, i, (v_start + make_interval(years => i - 1))::date, v_belopp)
    on conflict (organisasjon_id, aar) do nothing;
    get diagnostics v_rader = row_count;
    v_n := v_n + v_rader;
  end loop;
  return v_n;
end $$;

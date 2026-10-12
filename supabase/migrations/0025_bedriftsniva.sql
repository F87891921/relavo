-- Prisnivåer for selskap (etter antall leverandører). Brukes foreløpig bare i
-- tilbud; selvbetjent bestilling kommer når grensen på antall leverandører
-- håndheves.
alter table offerter drop constraint offerter_plan_check;
alter table offerter add constraint offerter_plan_check
  check (plan in ('engangs','liten','kommune','medelstor','stor','standard','enterprise','start','vekst','bygg'));

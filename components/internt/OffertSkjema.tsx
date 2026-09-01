"use client";

import { useOrd } from "@/components/Sprakgiver";

import { useState, useTransition } from "react";
import { FELT_FULL } from "@/components/ui/felt";
import { formaterOrgnr } from "@/lib/orgnr";
import {
  nyOfferte,
  relaterteFor,
  type Kundetreff,
  type Relatert,
} from "@/app/internt/handlinger";
import { PRIS, offertstatus } from "@/lib/offert";

const KNAPP =
  "bg-accent hover:bg-accent-hover active:scale-[0.97] transition text-white text-sm font-semibold px-5 py-2.5 rounded-xl disabled:opacity-50";

function Felt({
  navn,
  merke,
  type = "text",
  standard,
  plassholder,
  verdi,
  onEndre,
}: {
  navn: string;
  merke: string;
  type?: string;
  standard?: string;
  plassholder?: string;
  verdi?: string;
  onEndre?: (v: string) => void;
}) {
  return (
    <div className="mb-3.5">
      <label htmlFor={navn} className="block text-xs font-semibold mb-1.5">
        {merke}
      </label>
      <input
        id={navn}
        name={navn}
        type={type}
        defaultValue={onEndre ? undefined : standard}
        value={onEndre ? verdi : undefined}
        onChange={onEndre ? (e) => onEndre(e.target.value) : undefined}
        placeholder={plassholder}
        className={FELT_FULL}
      />
    </div>
  );
}

export function OffertSkjema({
  KundeSok,
}: {
  KundeSok: React.ComponentType<{
    navn?: string;
    merke?: string;
    onValgt?: (t: Kundetreff) => void;
  }>;
}) {
  const t = useOrd();
  const [apen, setApen] = useState(false);
  const [fritt, setFritt] = useState(false);
  const [feil, setFeil] = useState("");
  const [venter, start] = useTransition();

  const [orgNr, setOrgNr] = useState("");
  const [kontakt, setKontakt] = useState("");
  const [epost, setEpost] = useState("");

  // Alt vi har på det samme selskapet. Uten dette kunne man velge kunde
  // Bergen og koble tilbudet til et lead i Trondheim — da pekte tilbudet to
  // steder samtidig, og ingen av dem var feil hver for seg.
  const [relatert, setRelatert] = useState<Relatert | null>(null);

  if (!apen)
    return (
      <button type="button" onClick={() => setApen(true)} className={`${KNAPP} mb-5`}>
        + Ny offert
      </button>
    );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const skjema = e.currentTarget;
        const fd = new FormData(skjema);
        start(async () => {
          const res = await nyOfferte(fd);
          if (res.ok) {
            setApen(false);
            setFeil("");
            skjema.reset();
          } else setFeil(res.feil);
        });
      }}
      className="bg-surface rounded-card border border-border shadow-card p-6 mb-5"
    >
      <h2 className="text-[15px] font-semibold mb-4">{t.internt.nyOfferte}</h2>

      <div className="grid sm:grid-cols-2 gap-x-4">
        <KundeSok
          navn="kund"
          merke={t.internt.kunde}
          onValgt={(valgt) => {
            if (valgt.org_nr) setOrgNr(formaterOrgnr(valgt.org_nr));
            if (valgt.kontaktperson) setKontakt(valgt.kontaktperson);
            if (valgt.kontakt_epost) setEpost(valgt.kontakt_epost);
            relaterteFor(valgt.navn).then((r) => {
              setRelatert(r);
              // Organisasjonsnummeret finnes ofte på en annen enhet i samme
              // kommune selv om det ikke sto på den vi valgte.
              if (!valgt.org_nr) {
                const medNr = r.kontoer.find((k) => k.org_nr);
                if (medNr?.org_nr) setOrgNr(formaterOrgnr(medNr.org_nr));
              }
            });
          }}
        />

        <Felt
          navn="org_nr"
          merke={t.konto.organisasjonsnummer}
          plassholder="964 338 531"
          verdi={orgNr}
          onEndre={setOrgNr}
        />
        <Felt
          navn="kontaktperson"
          merke={t.internt.kontaktperson}
          verdi={kontakt}
          onEndre={setKontakt}
        />
        <Felt
          navn="kontakt_epost"
          merke={t.auth.epost}
          type="email"
          verdi={epost}
          onEndre={setEpost}
        />
        <Felt
          navn="fakturaadresse"
          merke={t.internt.fakturaadresse}
          plassholder="Postboks 7700, 5020 Bergen"
        />

        <div className="mb-3.5">
          <label htmlFor="lead_id" className="block text-xs font-semibold mb-1.5">
            {t.internt.leadKobling}
          </label>
          <select
            id="lead_id"
            name="lead_id"
            className={FELT_FULL}
            defaultValue=""
            disabled={!relatert}
          >
            <option value="">
              {relatert ? t.internt.ingenKobling : t.internt.velgKundeForst}
            </option>
            {(relatert?.leads ?? []).map((l) => (
              <option key={l.id} value={l.id}>
                {l.bolag}
                {l.kontakt ? ` — ${l.kontakt}` : ""}
              </option>
            ))}
          </select>
          {relatert && relatert.leads.length === 0 && (
            <div className="text-[11.5px] text-faint mt-1.5">
              {t.internt.ingenLeadsPa}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-border pt-4 mt-1">
        <label className="flex items-start gap-2.5 mb-4 cursor-pointer">
          <input
            type="checkbox"
            checked={fritt}
            onChange={(e) => setFritt(e.target.checked)}
            className="mt-0.5 accent-[#654b70] w-4 h-4 shrink-0"
          />
          <span className="text-[12.5px] leading-snug">
            <b>{t.internt.frittTilbud}</b>
            <span className="block text-dim">
              Ett avtalat antal kontroller till ett avtalat pris, utanför
              planerna.
            </span>
          </span>
        </label>

        {fritt ? (
          <div className="grid sm:grid-cols-2 gap-x-4">
            <Felt
              navn="fritt_antall"
              merke={t.internt.antallKontroller}
              type="number"
              plassholder="250"
            />
            <Felt
              navn="fritt_pris"
              merke={t.internt.totalpris}
              type="number"
              plassholder="180000"
            />
            <div className="sm:col-span-2 mb-3.5">
              <label htmlFor="notat" className="block text-xs font-semibold mb-1.5">
                Notat
              </label>
              <textarea
                id="notat"
                name="notat"
                rows={3}
                placeholder={t.internt.notatHjelp}
                className={`${FELT_FULL} max-w-none resize-y`}
              />
            </div>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-x-4">
            <div className="mb-3.5">
              <label htmlFor="plan" className="block text-xs font-semibold mb-1.5">
                {t.internt.plan}
              </label>
              <select id="plan" name="plan" defaultValue="standard" className={FELT_FULL}>
                {Object.entries(PRIS).map(([v, p]) => (
                  <option key={v} value={v}>
                    {p.mnd ? `${p.navn} — ${p.mnd} NOK/mån` : p.navn}
                  </option>
                ))}
              </select>
            </div>
            <Felt navn="ar" merke={t.internt.lopetidAr} type="number" standard="1" />
            <Felt navn="rabatt" merke={t.internt.rabatt} type="number" standard="0" />
          </div>
        )}
      </div>

      <div className="grid sm:grid-cols-2 gap-x-4 border-t border-border pt-4">
        <Felt navn="giltig_til" merke={t.internt.gyldigTil} type="date" />
        <div className="mb-3.5">
          <label htmlFor="betalingsfrist" className="block text-xs font-semibold mb-1.5">
            {t.internt.betalingsfristDager}
          </label>
          <select
            id="betalingsfrist"
            name="betalingsfrist"
            defaultValue="30"
            className={FELT_FULL}
          >
            {[10, 14, 20, 30, 45, 60].map((d) => (
              <option key={d} value={d}>
                {d} {t.internt.dager}
              </option>
            ))}
          </select>
          <div className="text-[11.5px] text-faint mt-1.5 leading-relaxed">
            {t.internt.betalingsfristHjelp}
          </div>
        </div>
        <div className="mb-3.5">
          <label htmlFor="status" className="block text-xs font-semibold mb-1.5">
            {t.felles.status}
          </label>
          <select id="status" name="status" defaultValue="utkast" className={FELT_FULL}>
            {offertstatus(t).map((s) => (
              <option key={s.verdi} value={s.verdi}>
                {s.tekst}
              </option>
            ))}
          </select>
        </div>
      </div>

      {feil && (
        <div className="text-xs text-bad bg-bad-bg rounded-xl px-3.5 py-2.5 mb-3">
          {feil}
        </div>
      )}

      <div className="flex gap-2.5">
        <button type="submit" disabled={venter} className={KNAPP}>
          {venter ? t.felles.lagrer : t.internt.lagreTilbud}
        </button>
        <button
          type="button"
          onClick={() => setApen(false)}
          className="text-sm text-dim hover:text-ink px-3 py-2.5 transition"
        >
          {t.felles.avbryt}
        </button>
      </div>
    </form>
  );
}

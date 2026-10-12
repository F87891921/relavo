"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useOrd } from "@/components/Sprakgiver";
import { kr } from "@/lib/priser";

type Treff = {
  kode: string;
  navn: string;
  innbyggere: number;
  ar: string;
  niva: "liten" | "kommune" | "medelstor" | "stor";
  mnd: number | null;
  mnd36: number | null;
};

/**
 * Skriv kommunenavnet, se prisen. Innbyggertallet kommer fra SSB via
 * /api/kommune, så tallet kunden ser er det samme vi regner med.
 */
export function Prisfinner() {
  const t = useOrd().landing.priser;
  const [q, setQ] = useState("");
  const [treff, setTreff] = useState<Treff[]>([]);
  const [valgt, setValgt] = useState<Treff | null>(null);
  const [status, setStatus] = useState<"hvile" | "soker" | "ingen" | "feil">("hvile");
  const teller = useRef(0);

  useEffect(() => {
    if (valgt && q === valgt.navn) return;
    if (q.trim().length < 2) {
      setTreff([]);
      setStatus("hvile");
      return;
    }
    const mitt = ++teller.current;
    setStatus("soker");
    const id = setTimeout(async () => {
      try {
        const r = await fetch(`/api/kommune?q=${encodeURIComponent(q)}`);
        if (mitt !== teller.current) return;
        if (!r.ok) return setStatus("feil");
        const d = await r.json();
        setTreff(d.treff);
        setStatus(d.treff.length ? "hvile" : "ingen");
      } catch {
        if (mitt === teller.current) setStatus("feil");
      }
    }, 220);
    return () => clearTimeout(id);
  }, [q, valgt]);

  const velg = (k: Treff) => {
    setValgt(k);
    setQ(k.navn);
    setTreff([]);
  };

  const n = valgt ? t.nivaer[valgt.niva] : null;

  return (
    <div className="pf">
      <label htmlFor="pf-q" className="pf-l">
        {t.sok.etikett}
      </label>
      <input
        id="pf-q"
        className="pf-i"
        value={q}
        autoComplete="off"
        placeholder={t.sok.plassholder}
        onChange={(e) => {
          setQ(e.target.value);
          setValgt(null);
        }}
      />
      {status === "soker" && <p className="pf-m">{t.sok.soker}</p>}
      {status === "ingen" && <p className="pf-m">{t.sok.ingenTreff}</p>}
      {status === "feil" && <p className="pf-m">{t.sok.utilgjengelig}</p>}

      {treff.length > 0 && !valgt && (
        <ul className="pf-liste">
          {treff.map((k) => (
            <li key={k.kode}>
              <button type="button" onClick={() => velg(k)}>
                <span>{k.navn}</span>
                <span>
                  {kr(k.innbyggere)} {t.sok.innbyggere}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      {valgt && n && (
        <div className="pf-res" aria-live="polite">
          <div className="pf-top">
            <b>{valgt.navn}</b>
            <span>
              {kr(valgt.innbyggere)} {t.sok.innbyggere} · {t.sok.kilde.replace("{ar}", valgt.ar)}
            </span>
          </div>
          <div className="pf-niva">
            {t.sok.niva}: <b>{n.navn}</b> <span>({n.spenn})</span>
          </div>
          {valgt.mnd !== null ? (
            <>
              <div className="pf-pris">
                {kr(valgt.mnd)} <em>NOK {t.sok.perMnd}</em>
              </div>
              {valgt.mnd36 !== null && (
                <p className="pf-36">
                  {t.sok.ved36} <b>{kr(valgt.mnd36)} NOK {t.sok.perMnd}</b>
                </p>
              )}
              <p className="pf-m">{t.sok.fakturering}</p>
              <p className="pf-m">{t.sok.tillegg}</p>
              <Link href={`/registrer?plan=${valgt.niva}`} className="btn btn-primary">
                {t.sok.komIGang}
              </Link>
            </>
          ) : (
            <>
              <p className="pf-36">{t.sok.storTekst}</p>
              <Link
                href={`/kontakt?om=priser&kommune=${encodeURIComponent(valgt.navn)}`}
                className="btn btn-primary"
              >
                {t.sok.beOmOffert}
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}

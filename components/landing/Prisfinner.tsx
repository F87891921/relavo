"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useOrd } from "@/components/Sprakgiver";
import { BEDRIFT, BEDRIFT_LOPETIDER, ENKELTKONTROLL, LOPETIDER, NIVAER, kr, mndBedrift, mndFor, type BedriftLopetid, type Lopetid } from "@/lib/priser";

type Treff = {
  kode: string;
  navn: string;
  innbyggere: number;
  ar: string;
  niva: "liten" | "kommune" | "medelstor" | "stor";
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
  const [lop, setLop] = useState<Lopetid>(12);
  const [lopB, setLopB] = useState<BedriftLopetid>(12);
  const [bn, setBn] = useState<"start" | "vekst" | "bygg" | "stor">("vekst");
  const [modus, setModus] = useState<"kommune" | "selskap">("kommune");
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

  const niva = valgt ? NIVAER.find((x) => x.id === valgt.niva)! : null;
  const n = valgt ? t.nivaer[valgt.niva] : null;
  const pris = niva ? mndFor(niva, lop) : null;

  const velgerLop = (
    <div className="pf-lop" role="group" aria-label={t.sok.avtale}>
      {LOPETIDER.map((l) => (
        <button key={l} type="button" aria-pressed={lop === l} onClick={() => setLop(l)}>
          {l} {t.sok.mnd}
        </button>
      ))}
    </div>
  );

  const velgerLopB = (
    <div className="pf-lop" role="group" aria-label={t.sok.avtale}>
      {BEDRIFT_LOPETIDER.map((l) => (
        <button key={l} type="button" aria-pressed={lopB === l} onClick={() => setLopB(l)}>
          {l === 1 ? t.sok.manedsvis : `${l} ${t.sok.mnd}`}
        </button>
      ))}
    </div>
  );

  return (
    <div className="pf">
      <div className="pf-lop pf-modus" role="group">
        {(["kommune", "selskap"] as const).map((m) => (
          <button key={m} type="button" aria-pressed={modus === m} onClick={() => setModus(m)}>
            {t.maltype[m]}
          </button>
        ))}
      </div>

      {modus === "selskap" && (
        <div className="pf-res">
          <div className="pf-top">
            <b>{t.bedrift.etikett}</b>
            <span>{t.bedrift.tekst}</span>
          </div>
          {velgerLopB}
          <table className="pf-bt">
            <tbody>
              {BEDRIFT.map((b) => {
                const m = mndBedrift(b, lopB);
                return (
                  <tr
                    key={b.id}
                    className={bn === b.id ? "pf-valgt" : undefined}
                    onClick={() => setBn(b.id)}
                  >
                    <td>
                      <b>{t.bedrift.nivaer[b.id].navn}</b>
                      <small>{t.bedrift.nivaer[b.id].spenn}</small>
                    </td>
                    <td>{m === null ? t.tabell.offert : `${kr(m)} NOK`}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="pf-m">{lopB === 1 ? t.bedrift.manedNote : t.sok.fakturering} {t.sok.tillegg}</p>
          <p className="pf-m">
            <b>{t.enkelt.navn}</b>: {kr(ENKELTKONTROLL)} {t.enkelt.enhet}. <Link href="/registrer?plan=engangs" className="pf-lenke">{t.enkelt.knapp}</Link>
          </p>
          {bn === "stor" ? (
            <Link href="/kontakt?om=priser" className="btn btn-primary">
              {t.bedrift.knapp}
            </Link>
          ) : (
            <Link href={`/registrer?plan=${bn}&mnd=${lopB}`} className="btn btn-primary">
              {t.sok.komIGang}
            </Link>
          )}
        </div>
      )}

      {modus === "kommune" && (<>
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
          {pris !== null ? (
            <>
              {velgerLop}
              <div className="pf-pris">
                {kr(pris)} <em>NOK {t.sok.perMnd}</em>
              </div>
              <p className="pf-m">
                {t.sok.fakturering} {t.sok.tillegg}
              </p>
              <Link href={`/registrer?plan=${valgt.niva}&mnd=${lop}`} className="btn btn-primary">
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

      <div className="pf-samlet">
        <h3>{t.samlet.tittel}</h3>
        <p className="pf-m">{t.samlet.per}</p>
        <div className="pf-gr">
          <div>
            <div className="pf-gt"><b>{t.samlet.kommuneTittel}</b> <span>{t.samlet.kommuneUnder}</span></div>
            <div className="pf-tw"><table>
              <thead><tr><th>{t.samlet.nivaa}</th><th>{t.samlet.leverandorer}</th>{LOPETIDER.map((l) => <th key={l}>{l} {t.sok.mnd}</th>)}</tr></thead>
              <tbody>
                {NIVAER.map((x) => (
                  <tr key={x.id}>
                    <td><b>{t.nivaer[x.id].navn}</b><small>{t.nivaer[x.id].spenn}</small></td>
                    <td data-l={t.samlet.leverandorer}>{t.samlet.ubegrenset}</td>
                    {LOPETIDER.map((l) => { const m = mndFor(x, l); return <td key={l} data-l={`${l} ${t.sok.mnd}`}>{m === null ? t.samlet.offert : kr(m)}</td>; })}
                  </tr>
                ))}
              </tbody>
            </table></div>
          </div>
          <div>
            <div className="pf-gt"><b>{t.samlet.selskapTittel}</b> <span>{t.samlet.selskapUnder}</span></div>
            <div className="pf-tw"><table>
              <thead><tr><th>{t.samlet.nivaa}</th><th>{t.samlet.leverandorer}</th>{BEDRIFT_LOPETIDER.map((l) => <th key={l}>{l === 1 ? t.samlet.manedlig : `${l} ${t.sok.mnd}`}</th>)}</tr></thead>
              <tbody>
                {BEDRIFT.map((b) => (
                  <tr key={b.id}>
                    <td><b>{t.bedrift.nivaer[b.id].navn}</b></td>
                    <td data-l={t.samlet.leverandorer}>{b.maks === null ? "400+" : b.maks}</td>
                    {BEDRIFT_LOPETIDER.map((l) => {
                      const m = mndBedrift(b, l);
                      // Besparelsen er mot å kjøpe en enkeltkontroll for hver leverandør i en full plan.
                      const sparer = m !== null && b.maks !== null ? Math.round((1 - (m * 12) / (b.maks * ENKELTKONTROLL)) * 100) : null;
                      return (
                        <td key={l} data-l={l === 1 ? t.samlet.manedlig : `${l} ${t.sok.mnd}`}>
                          {m === null ? t.samlet.offert : kr(m)}
                          {sparer !== null && <small className="pf-sp">−{sparer} %</small>}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table></div>
          </div>
        </div>
        <p className="pf-m">{t.samlet.sparerForklaring}</p>
        <p className="pf-m">{t.samlet.inkludert}</p>
      </div>

      <details className="pf-regn">
        <summary>{t.tabell.tittel}</summary>
        <p>{t.tabell.tekst}</p>
        <ul className="pf-ingar-l">
          {t.ingar.punkter.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </details>
      </>)}
    </div>
  );
}

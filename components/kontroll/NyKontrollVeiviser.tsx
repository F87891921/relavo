"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { validerOrgnr, formaterOrgnr } from "@/lib/orgnr";
import type { Enhet } from "@/lib/brreg";
import { kjorKontroll } from "@/app/(dashboard)/ny-kontroll/handlinger";
import { HMS_PUNKTER, type Svar } from "@/lib/kontroll";
import { Steg, Foten, Kort, Felt, INPUT } from "./Steg";

const ANSK_FELT = [
  { k: "diar", l: "Saksnummer", t: "text", ph: "K-2026-118" },
  { k: "best", l: "Bestiller", t: "text", ph: "Etat for utbygging" },
  { k: "saks", l: "Saksbehandler", t: "text", ph: "Marit Aasen" },
  {
    k: "type",
    l: "Konkurranseform",
    t: "select",
    opt: [
      "Åpen anbudskonkurranse",
      "Begrenset anbudskonkurranse",
      "Åpen tilbudskonkurranse",
      "Begrenset tilbudskonkurranse",
      "Konkurranse med forhandling",
    ],
  },
  { k: "fra", l: "Avtale fra", t: "date" },
  { k: "til", l: "Avtale til", t: "date" },
  { k: "verdi", l: "Avtaleverdi (NOK)", t: "text", ph: "96 000 000" },
  {
    k: "opsj",
    l: "Opsjon",
    t: "select",
    opt: ["Ingen opsjon", "1 år", "2 år", "1 + 1 år", "2 + 1 år"],
  },
] as const;

export function NyKontrollVeiviser() {
  const router = useRouter();
  const [steg, setSteg] = useState(0);

  const [orgnrTekst, setOrgnrTekst] = useState("");
  const [enhet, setEnhet] = useState<Enhet | null>(null);
  const [slaarOpp, setSlaarOpp] = useState(false);
  const [oppslagFeil, setOppslagFeil] = useState("");

  const [offentlig, setOffentlig] = useState(true);
  const [sak, setSak] = useState<Record<string, string>>({});
  const [hms, setHms] = useState<string[]>([]);
  const [espd, setEspd] = useState<"finnes" | "be" | null>(null);
  const [espdFrist, setEspdFrist] = useState("");

  const [kjorer, setKjorer] = useState(false);
  const [kjorFeil, setKjorFeil] = useState("");

  // Bare sifrene teller. Alle norske organisasjonsnumre er ni siffer —
  // AS, ASA, ENK og kommune bruker samme format, så det finnes ingen
  // selskapsform å skille på her. Formen kommer først av oppslaget.
  const sifre = orgnrTekst.replace(/\D/g, "");
  const validering = validerOrgnr(orgnrTekst);
  const fullLengde = sifre.length === 9;

  async function slaOpp() {
    setOppslagFeil("");
    setEnhet(null);
    if (!validering.ok) {
      setOppslagFeil(validering.feil);
      return;
    }
    setSlaarOpp(true);
    try {
      const svar = await fetch(`/api/oppslag?orgnr=${validering.orgnr}`);
      const data = await svar.json();
      if (!svar.ok) setOppslagFeil(data.feil ?? "Oppslaget mislyktes.");
      else setEnhet(data.enhet);
    } catch {
      setOppslagFeil("Fikk ikke kontakt med Enhetsregisteret.");
    } finally {
      setSlaarOpp(false);
    }
  }

  async function kjor() {
    setKjorFeil("");
    setKjorer(true);
    const svar: Svar = {
      orgnr: validering.ok ? validering.orgnr : orgnrTekst,
      offentlig,
      sak,
      hms,
      espd,
      espdFrist: espd === "be" && espdFrist ? espdFrist : null,
    };
    const res = await kjorKontroll(svar);
    setKjorer(false);
    if (!res.ok) {
      setKjorFeil(res.feil);
      return;
    }
    router.push("/leverandorer");
    router.refresh();
  }

  /**
   * Teller sifrene mens man skriver. Poenget er at feilen skal oppdages i
   * feltet, ikke etter et bomtur til registeret.
   */
  function hint() {
    if (sifre.length === 0)
      return "Ni siffer. Kontrollsifferet valideres med modulus 11 før oppslag.";
    if (!fullLengde)
      return `${sifre.length} av 9 siffer — ${9 - sifre.length} igjen.`;
    if (!validering.ok) return validering.feil;
    return "Ni siffer, kontrollsifferet stemmer. Klar for oppslag.";
  }

  return (
    <>
      <Steg na={steg} />

      {steg === 0 && (
        <>
          <Kort>
            <Felt
              id="orgnr"
              merke="Organisasjonsnummer"
              hint={hint()}
              feil={fullLengde && !validering.ok}
            >
              <input
                id="orgnr"
                inputMode="numeric"
                autoComplete="off"
                placeholder="000 000 000"
                value={orgnrTekst}
                onChange={(e) => {
                  // Grupperer i treere mens man skriver, slik Brønnøysund
                  // selv skriver dem. Overskytende siffer forkastes heller
                  // enn å bli stående usynlig utenfor feltet.
                  const rene = e.target.value.replace(/\D/g, "").slice(0, 9);
                  setOrgnrTekst(formaterOrgnr(rene));
                  setEnhet(null);
                  setOppslagFeil("");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && fullLengde && validering.ok) {
                    e.preventDefault();
                    slaOpp();
                  }
                }}
                aria-invalid={fullLengde && !validering.ok}
                className={`${INPUT} font-mono tracking-wide ${
                  fullLengde && !validering.ok
                    ? "border-bad focus:border-bad focus:ring-bad-bg"
                    : ""
                }`}
              />
            </Felt>

            <button
              type="button"
              onClick={slaOpp}
              disabled={slaarOpp || !validering.ok}
              className="text-sm font-semibold px-4 py-2.5 rounded-xl bg-surface shadow-card hover:bg-surface2 active:scale-[0.97] transition disabled:opacity-60"
            >
              {slaarOpp ? "Slår opp …" : "Slå opp i Enhetsregisteret"}
            </button>

            {oppslagFeil && (
              <div className="text-xs text-bad bg-bad-bg rounded-xl px-3.5 py-2.5 mt-4">
                {oppslagFeil}
              </div>
            )}

            {enhet && <Treff enhet={enhet} />}
          </Kort>
          <Foten neste={() => setSteg(1)} nesteAv={!enhet} />
        </>
      )}

      {steg === 1 && (
        <>
          <Kort>
            <h2 className="text-[15px] font-semibold mb-1.5">
              Gjelder dette en offentlig anskaffelse etter anskaffelsesloven?
            </h2>
            <p className="text-[12.5px] text-dim leading-relaxed mb-4">
              Svarer du ja, kjøres kontrollen mot avvisningsgrunnene i
              anskaffelsesforskriften § 24-2 og de nye pliktene i §§ 5e–5k.
            </p>
            <Valg
              navn="loa"
              valgt={offentlig ? "ja" : "nei"}
              velg={(v) => setOffentlig(v === "ja")}
              alternativ={[
                {
                  verdi: "ja",
                  tittel: "Ja, offentlig anskaffelse",
                  tekst:
                    "Full kontroll mot avvisningsgrunner, skatteattest, leddbegrensning og lærlingekrav.",
                },
                {
                  verdi: "nei",
                  tittel: "Nei, privat innkjøp",
                  tekst:
                    "Kontrollerer selskapsdata, økonomi og sanksjonslister. Ingen paragrafvurdering.",
                },
              ]}
            />
          </Kort>
          <Foten tilbake={() => setSteg(0)} neste={() => setSteg(2)} />
        </>
      )}

      {steg === 2 && (
        <>
          <Kort>
            <h2 className="text-[15px] font-semibold mb-1">Saksopplysninger</h2>
            <p className="text-[12.5px] text-dim leading-relaxed mb-4">
              Valgfritt. Fyller du inn saksnummer og bestiller, kan kontrollen
              hentes fram fra anskaffelsesprotokollen senere.
            </p>
            <div className="grid sm:grid-cols-2 gap-x-4">
              {ANSK_FELT.map((f) => (
                <Felt key={f.k} id={`sak-${f.k}`} merke={f.l}>
                  {f.t === "select" ? (
                    <select
                      id={`sak-${f.k}`}
                      className={INPUT}
                      value={sak[f.k] ?? ""}
                      onChange={(e) =>
                        setSak({ ...sak, [f.k]: e.target.value })
                      }
                    >
                      <option value="">Velg …</option>
                      {"opt" in f &&
                        f.opt.map((o) => <option key={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      id={`sak-${f.k}`}
                      type={f.t}
                      placeholder={"ph" in f ? f.ph : undefined}
                      className={INPUT}
                      value={sak[f.k] ?? ""}
                      onChange={(e) =>
                        setSak({ ...sak, [f.k]: e.target.value })
                      }
                    />
                  )}
                </Felt>
              ))}
            </div>
          </Kort>
          <Foten
            tilbake={() => setSteg(1)}
            hoppOver={() => {
              setSak({});
              setSteg(3);
            }}
            neste={() => setSteg(3)}
          />
        </>
      )}

      {steg === 3 && (
        <>
          <Kort>
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="text-[15px] font-semibold">
                Tariffavtale, HMS-kort og lønnsvilkår
              </h2>
              <span className="text-[11.5px] text-faint">
                Kryss av det du har bekreftet
              </span>
            </div>
            <div className="space-y-1">
              {HMS_PUNKTER.map((p) => (
                <label
                  key={p.k}
                  className="flex items-start gap-3 py-2.5 px-3 -mx-1 rounded-xl hover:bg-canvas cursor-pointer transition"
                >
                  <input
                    type="checkbox"
                    checked={hms.includes(p.k)}
                    onChange={(e) =>
                      setHms(
                        e.target.checked
                          ? [...hms, p.k]
                          : hms.filter((x) => x !== p.k),
                      )
                    }
                    className="mt-0.5 accent-[#654b70] w-4 h-4 shrink-0"
                  />
                  <span className="font-mono text-[10.5px] text-accent w-9 shrink-0 mt-[3px]">
                    {p.ref}
                  </span>
                  <span className="text-[13px] leading-snug">{p.t}</span>
                </label>
              ))}
            </div>
            <p className="text-[11.5px] text-faint mt-4 leading-relaxed">
              Det du ikke krysser av blir stående som ikke kontrollert i
              rapporten. Ingenting blir stilltiende godkjent.
            </p>
          </Kort>
          <Foten
            tilbake={() => setSteg(2)}
            hoppOver={() => {
              setHms([]);
              setSteg(4);
            }}
            neste={() => setSteg(4)}
          />
        </>
      )}

      {steg === 4 && (
        <>
          <Kort>
            <h2 className="text-[15px] font-semibold mb-1.5">
              Egenerklæring fra leverandøren
            </h2>
            <p className="text-[12.5px] text-dim leading-relaxed mb-4">
              {offentlig
                ? "ESPD-egenerklæringen dekker den delen av kvalifikasjonsvurderingen vi ikke kan kontrollere mot registrene."
                : "Ved private innkjøp er egenerklæring frivillig, men den lagres som vedlegg hvis den finnes."}
            </p>
            <Valg
              navn="espd"
              valgt={espd ?? ""}
              velg={(v) => setEspd(v as "finnes" | "be")}
              alternativ={[
                {
                  verdi: "finnes",
                  tittel: "Levert med tilbudet",
                  tekst:
                    "Hentes fra anskaffelsen og sammenlignes med registrene. Motstrid flagges som avvisningsgrunn etter § 24-2 tredje ledd.",
                },
                {
                  verdi: "be",
                  tittel: "Ikke levert — be om ettersending",
                  tekst:
                    "Manglende egenerklæring er normalt en mangel som kan repareres etter § 23-5, i motsetning til innholdet i tilbudet.",
                },
              ]}
            />
            {espd === "be" && (
              <div className="mt-4">
                <Felt
                  id="espdfrist"
                  merke="Frist for ettersending"
                  hint="Ti virkedager er vanlig."
                >
                  <input
                    id="espdfrist"
                    type="date"
                    className={INPUT}
                    value={espdFrist}
                    onChange={(e) => setEspdFrist(e.target.value)}
                  />
                </Felt>
              </div>
            )}
          </Kort>
          <Foten
            tilbake={() => setSteg(3)}
            hoppOver={() => {
              setEspd(null);
              setSteg(5);
            }}
            neste={() => setSteg(5)}
            nesteAv={espd === null}
          />
        </>
      )}

      {steg === 5 && (
        <>
          <Kort>
            <h2 className="text-[15px] font-semibold mb-4">Oppsummering</h2>
            <Oppsummering
              enhet={enhet}
              offentlig={offentlig}
              sak={sak}
              hms={hms}
              espd={espd}
              espdFrist={espdFrist}
            />
            {kjorFeil && (
              <div className="text-xs text-bad bg-bad-bg rounded-xl px-3.5 py-2.5 mt-4">
                {kjorFeil}
              </div>
            )}
          </Kort>
          <Foten
            tilbake={() => setSteg(4)}
            neste={kjor}
            nesteTekst={kjorer ? "Kjører …" : "Kjør kontrollen"}
            nesteAv={kjorer}
          />
        </>
      )}
    </>
  );
}

function Treff({ enhet }: { enhet: Enhet }) {
  const flagg = [
    enhet.konkurs && "Konkurs",
    enhet.underTvangsavvikling && "Under tvangsavvikling",
    enhet.underAvvikling && "Under avvikling",
  ].filter(Boolean) as string[];

  return (
    <div className="mt-5 border-t border-border pt-5">
      <div className="text-[17px] font-semibold tracking-tight">{enhet.navn}</div>
      <div className="font-mono text-[12px] text-faint mt-0.5">
        {formaterOrgnr(enhet.orgnr)}
      </div>

      <dl className="grid grid-cols-2 gap-x-5 gap-y-2.5 mt-4 text-[13px]">
        {[
          ["Organisasjonsform", enhet.form],
          ["Bransje", enhet.bransje],
          ["Sted", enhet.sted],
          ["Ansatte", enhet.ansatte === null ? null : String(enhet.ansatte)],
          ["Registrert", enhet.registrert],
        ].map(([m, v]) => (
          <div key={m as string}>
            <dt className="text-[11px] uppercase tracking-wide text-faint">{m}</dt>
            <dd className="mt-0.5">{v ?? "—"}</dd>
          </div>
        ))}
      </dl>

      {flagg.length > 0 ? (
        <div className="mt-4 bg-bad-bg text-bad rounded-xl px-3.5 py-3 text-[12.5px]">
          <b>Avvisningsgrunn etter § 24-2:</b> {flagg.join(", ")}.
        </div>
      ) : (
        <div className="mt-4 inline-flex items-center gap-1.5 bg-good-bg text-good rounded-full px-2.5 py-1 text-[11px] font-semibold">
          Ingen konkurs eller avvikling registrert
        </div>
      )}
    </div>
  );
}

function Valg({
  navn,
  valgt,
  velg,
  alternativ,
}: {
  navn: string;
  valgt: string;
  velg: (v: string) => void;
  alternativ: { verdi: string; tittel: string; tekst: string }[];
}) {
  return (
    <div className="space-y-2">
      {alternativ.map((a) => (
        <label
          key={a.verdi}
          className={`flex gap-3 p-3.5 rounded-xl border cursor-pointer transition ${
            valgt === a.verdi
              ? "border-accent bg-accent-light"
              : "border-border-strong hover:bg-canvas"
          }`}
        >
          <input
            type="radio"
            name={navn}
            value={a.verdi}
            checked={valgt === a.verdi}
            onChange={() => velg(a.verdi)}
            className="mt-0.5 accent-[#654b70] shrink-0"
          />
          <span>
            <span className="block text-[13.5px] font-semibold">{a.tittel}</span>
            <span className="block text-[12px] text-dim leading-snug mt-1">
              {a.tekst}
            </span>
          </span>
        </label>
      ))}
    </div>
  );
}

function Oppsummering({
  enhet,
  offentlig,
  sak,
  hms,
  espd,
  espdFrist,
}: {
  enhet: Enhet | null;
  offentlig: boolean;
  sak: Record<string, string>;
  hms: string[];
  espd: "finnes" | "be" | null;
  espdFrist: string;
}) {
  const utfylt = Object.entries(sak).filter(([, v]) => v.trim());

  const rader: [string, string][] = [
    ["Selskap", enhet ? `${enhet.navn} (${formaterOrgnr(enhet.orgnr)})` : "—"],
    ["Type innkjøp", offentlig ? "Offentlig anskaffelse" : "Privat innkjøp"],
    [
      "Saksopplysninger",
      utfylt.length ? `${utfylt.length} felt utfylt` : "Hoppet over",
    ],
    [
      "Tariff og HMS",
      hms.length ? `${hms.length} av ${HMS_PUNKTER.length} bekreftet` : "Ingen bekreftet",
    ],
    [
      "Egenerklæring",
      espd === "finnes"
        ? "Levert med tilbudet"
        : espd === "be"
          ? `Etterspurt${espdFrist ? `, frist ${espdFrist}` : ""}`
          : "Hoppet over",
    ],
  ];

  return (
    <>
      <dl className="divide-y divide-border">
        {rader.map(([m, v]) => (
          <div key={m} className="flex justify-between gap-4 py-2.5 text-[13px]">
            <dt className="text-dim">{m}</dt>
            <dd className="font-semibold text-right">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="text-[11.5px] text-faint mt-4 leading-relaxed">
        Kontrollen lagres uendret med kilde og tidspunkt på hver linje. Kilder
        vi ikke har avtale med ennå står oppført som ikke hentet.
      </p>
    </>
  );
}

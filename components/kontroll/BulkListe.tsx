"use client";

import { useRef, useState } from "react";
import { validerOrgnr, formaterOrgnr } from "@/lib/orgnr";
import { Merke, Tabell } from "@/components/ui";
import { FELT_FULL } from "@/components/ui/felt";

/**
 * Bulkkontroll. Nummerne valideres med modulus 11 med én gang, før noe
 * sendes noe sted — det er billigere å fange tastefeil her enn å oppdage
 * dem som «fant ingen treff» etter hundre oppslag.
 *
 * Filen leses i nettleseren, ikke på serveren. En leverandørliste kan
 * inneholde langt mer enn organisasjonsnumre — priser, kontaktpersoner,
 * interne notater — og det er ingen grunn til at noe av det skal forlate
 * maskinen når vi bare trenger ni siffer per rad.
 */
export function BulkListe() {
  const [tekst, setTekst] = useState("");
  const [filnavn, setFilnavn] = useState("");
  const [filfeil, setFilfeil] = useState("");
  const [leser, setLeser] = useState(false);
  const filvelger = useRef<HTMLInputElement>(null);

  const linjer = tekst
    .split(/[\s,;]+/)
    .map((l) => l.trim())
    .filter(Boolean);

  const sjekket = linjer.map((l) => ({ rå: l, res: validerOrgnr(l) }));
  const gyldige = sjekket.filter((s) => s.res.ok);
  const ugyldige = sjekket.filter((s) => !s.res.ok);

  async function lesFil(fil: File) {
    setFilfeil("");
    setLeser(true);
    setFilnavn(fil.name);

    try {
      const navn = fil.name.toLowerCase();
      let celler: string[] = [];

      if (navn.endsWith(".xlsx") || navn.endsWith(".xls")) {
        // Lastes først når noen faktisk laster opp et regneark, så
        // biblioteket ikke ligger i bunten for alle andre.
        const XLSX = await import("xlsx");
        const bok = XLSX.read(await fil.arrayBuffer(), { type: "array" });

        // Alle ark, alle celler. Nummeret står sjelden i første kolonne, og
        // hvilken kolonne det er varierer fra kunde til kunde.
        for (const arknavn of bok.SheetNames) {
          const rader = XLSX.utils.sheet_to_json<unknown[]>(
            bok.Sheets[arknavn],
            { header: 1, raw: false },
          );
          for (const rad of rader)
            for (const celle of rad) celler.push(String(celle ?? ""));
        }
      } else {
        // Skilletegnene i en CSV holder cellene fra hverandre.
        celler = (await fil.text()).split(/[\n\r,;\t]+/);
      }

      // Én celle om gangen. Slår man hele arket sammen først og fjerner
      // mellomrommene, renner sifrene fra to celler over i hverandre:
      // «12345» ved siden av «938702675» ble til «123459387» — et nummer
      // som ikke står i filen, men som ser like ekte ut som de andre.
      const funnet: string[] = [];
      for (const celle of celler) {
        // Mellomrom inne i én celle er derimot trygt å fjerne, så
        // «938 702 675» leses som ett nummer.
        const rensket = celle.replace(/\s/g, "");
        for (const treff of rensket.match(/\d{9}/g) ?? [])
          if (!funnet.includes(treff)) funnet.push(treff);
      }

      if (!funnet.length) {
        setFilfeil(
          "Fant ingen niesifrede tall i filen. Er organisasjonsnumrene delt over flere kolonner?",
        );
        return;
      }

      setTekst(funnet.join("\n"));
    } catch {
      setFilfeil("Kunne ikke lese filen. Er den skadet, eller passordbeskyttet?");
    } finally {
      setLeser(false);
    }
  }

  return (
    <>
      <div className="bg-surface rounded-card border border-border shadow-card p-6 mb-5">
        <div className="mb-5">
          <div className="text-xs font-semibold mb-1.5">Last opp en liste</div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={filvelger}
              type="file"
              accept=".xlsx,.xls,.csv,.txt,.tsv"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) lesFil(f);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              onClick={() => filvelger.current?.click()}
              disabled={leser}
              className="text-sm font-semibold px-4 py-2.5 rounded-xl bg-canvas border border-border hover:border-border-strong active:scale-[0.97] transition disabled:opacity-60"
            >
              {leser ? "Leser filen …" : "Velg fil"}
            </button>
            <span className="text-[12px] text-faint">
              {filnavn ? (
                <>
                  <b className="text-ink">{filnavn}</b> — {linjer.length} numre
                  hentet
                </>
              ) : (
                "Excel, CSV eller tekst. Filen leses her i nettleseren og sendes ikke noe sted."
              )}
            </span>
          </div>
          {filfeil && (
            <div className="text-xs text-bad bg-bad-bg rounded-xl px-3.5 py-2.5 mt-3">
              {filfeil}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 mb-4">
          <span className="h-px flex-1 bg-border" />
          <span className="text-[11px] text-faint">eller lim inn</span>
          <span className="h-px flex-1 bg-border" />
        </div>

        <label htmlFor="bulk" className="block text-xs font-semibold mb-1.5">
          Organisasjonsnumre
        </label>
        <textarea
          id="bulk"
          rows={7}
          value={tekst}
          onChange={(e) => setTekst(e.target.value)}
          placeholder={"924118504\n913550870\n918774203"}
          className={`${FELT_FULL} max-w-none font-mono resize-y`}
        />
        <div className="text-[11.5px] text-faint mt-1.5">
          Ett nummer per linje, eller skilt med komma. Kontrollsifferet
          valideres med modulus 11 mens du skriver.
        </div>

        {linjer.length > 0 && (
          <div className="flex flex-wrap gap-2.5 mt-4">
            <Merke tone="god">{gyldige.length} gyldige</Merke>
            {ugyldige.length > 0 && (
              <Merke tone="brudd">{ugyldige.length} ugyldige</Merke>
            )}
            <button
              type="button"
              onClick={() => {
                setTekst("");
                setFilnavn("");
                setFilfeil("");
              }}
              className="text-[12px] text-dim hover:text-ink transition"
            >
              Tøm lista
            </button>
          </div>
        )}

        <button
          type="button"
          disabled
          className="mt-5 bg-accent text-white text-sm font-semibold px-5 py-2.5 rounded-xl opacity-40 pointer-events-none"
        >
          Kjør {gyldige.length || ""} kontroller
        </button>
        <div className="text-[11.5px] text-faint mt-2">
          Kjøringen krever en kø i bakgrunnen — hundre oppslag kan ikke gjøres
          i én forespørsel. Ikke koblet på ennå.
        </div>
      </div>

      {linjer.length > 0 && (
        <div className="bg-surface rounded-card border border-border shadow-card overflow-hidden">
          <Tabell
            kolonner={["Nummer", "Status"]}
            rader={sjekket.map((s) => [
              <span key="n" className="font-mono text-[12.5px]">
                {s.res.ok ? formaterOrgnr(s.res.orgnr) : s.rå}
              </span>,
              s.res.ok ? (
                <Merke key="s" tone="god">Klar for oppslag</Merke>
              ) : (
                <span key="s" className="text-bad text-[12.5px]">{s.res.feil}</span>
              ),
            ])}
          />
        </div>
      )}
    </>
  );
}

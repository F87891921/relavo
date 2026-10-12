import { ord } from "@/lib/sprak";

/**
 * Det ene tallet på forsiden, sagt med ord.
 *
 * To av fem renholdsvirksomheter i Arbeidstilsynets register er ikke
 * godkjent. Det sier hva som står på spill om man leser registeret feil:
 * en treff betyr ikke godkjent, og et verktøy som tror det grønnmerker
 * selskaper det har vært ulovlig å kjøpe renhold av siden 2012.
 *
 * Første utgave var et stort rødt 3 254 i et kort med skygge. Begge
 * delene var feil. Rødt er sidens varselsignal og hører til brudd i en
 * kontroll — brukes det på en statistikk, betyr det mindre neste gang
 * det står ved et faktisk avvik. Og «to av fem» er lettere å ta med seg
 * enn 3 254.
 *
 * De eksakte tallene står igjen under, små, fordi påstanden skal kunne
 * ettergås. De hentes fra basen og skrives ikke inn: et tall i en setning
 * blir feil den dagen registeret endrer seg.
 *
 * Ingen opptelling. Den fantes for å trekke blikket til et tall som ikke
 * lenger er det man skal lese.
 */
export function Tallet({
  ikkeGodkjente,
  totalt,
  hentet,
}: {
  ikkeGodkjente: number;
  totalt: number;
  hentet: string | null;
}) {
  const t = ord().landing.tallet;

  const tall = (n: number) => n.toLocaleString("nb-NO").replace(/ /g, " ");

  // Avrundingen gjøres her, ikke i teksten, så brøken følger registeret.
  // Blir andelen en annen, endrer setningen seg med den.
  //
  // Tallordet skrives ut. «2 av fem» blander siffer og ord i samme
  // brøk, og det leses som en skrivefeil — det er nettopp den
  // setningen som skal bæres av at den ser omsorgsfullt satt ut.
  const femtedeler = Math.min(5, Math.max(1, Math.round((ikkeGodkjente / totalt) * 5)));
  const ordet = t.tallord[String(femtedeler) as keyof typeof t.tallord];

  return (
    <section className="tallet" data-avsloj>
      <div className="tallet-in">
        <p className="tallet-n">
          {t.brok.replace("{n}", ordet)}{" "}
          <span>{t.staarIkke}</span>
        </p>
        <p className="tallet-d">{t.poeng}</p>
        <p className="tallet-k">
          {tall(ikkeGodkjente)} {t.av} {tall(totalt)} {t.virksomheter}
          {hentet && (
            <> · {t.hentet} {new Date(hentet).toLocaleDateString("nb-NO")}</>
          )}
        </p>
      </div>
    </section>
  );
}

import Link from "next/link";

export type Flik = {
  navn: string;
  href: string;
  aktiv?: boolean;
  /** Antall. Skjules helt når det er null — et merke som sier 0 er støy. */
  antall?: number | null;
};

/**
 * Fanerad for det som hører sammen.
 *
 * Menyen hadde ti punkter der alle veide like mye, og fire av dem var
 * tomme mesteparten av tiden. De fire sto likevel og krevde et valg hver
 * gang noen så på menyen.
 *
 * Her er de samlet. Fanene er vanlige lenker til sidene som allerede
 * finnes — ingen av dem har flyttet, de har bare sluttet å være en
 * toppnivåbeslutning.
 *
 * Tallet står bare når det er noe der. Et merke som sier 0 er en
 * opplysning man må lese for å finne ut at den ikke betyr noe.
 */
export function Flikar({ flikar }: { flikar: Flik[] }) {
  return (
    <div className="flex gap-1.5 mb-5 overflow-x-auto -mx-1 px-1 pb-0.5">
      {flikar.map((f) => (
        <Link
          key={f.href}
          href={f.href}
          aria-current={f.aktiv ? "page" : undefined}
          className={`shrink-0 flex items-center gap-2 text-[13px] px-3.5 py-2 rounded-xl transition ${
            f.aktiv
              ? "bg-surface text-ink font-semibold shadow-card"
              : "text-dim hover:text-ink hover:bg-surface"
          }`}
        >
          {f.navn}
          {!!f.antall && (
            <span
              className={`text-[11px] font-bold px-1.5 rounded-full min-w-[18px] text-center leading-[17px] ${
                f.aktiv ? "bg-surface2 text-accent" : "bg-surface2 text-dim"
              }`}
            >
              {f.antall}
            </span>
          )}
        </Link>
      ))}
    </div>
  );
}

import { FELT_FULL as INPUT } from "@/components/ui/felt";
export { FELT_FULL as INPUT } from "@/components/ui/felt";
export const STEGNAVN = [
  "Selskap",
  "Anskaffelse",
  "Saksopplysninger",
  "Tariff og HMS",
  "Egenerklæring",
  "Oppsummering",
];

/**
 * Framdriftsstripa øverst. Passerte steg er fylt, resten er tomme.
 *
 * Seks navn ved siden av hverandre får ikke plass på en telefon — de ble
 * kuttet til «1 Selsk…, 2 Ansk…», som er verre enn ingen navn. Under sm
 * vises derfor bare stripene, med navnet på det steget man faktisk står på
 * under.
 */
export function Steg({ na }: { na: number }) {
  return (
    <div className="mb-6 sm:mb-7">
      <div className="flex gap-1.5 sm:gap-2">
        {STEGNAVN.map((navn, i) => {
          const passert = i < na;
          const aktiv = i === na;
          return (
            <div key={navn} className="flex-1 min-w-0">
              <div
                className={`h-[3px] rounded-full mb-2 transition ${
                  passert || aktiv ? "bg-accent" : "bg-border"
                }`}
              />
              <div
                className={`hidden sm:block text-[11.5px] truncate transition ${
                  aktiv ? "text-ink font-semibold" : "text-faint"
                }`}
              >
                {i + 1} {navn}
              </div>
            </div>
          );
        })}
      </div>
      <div className="sm:hidden text-[12px] mt-2">
        <span className="font-semibold">{STEGNAVN[na]}</span>
        <span className="text-faint"> — steg {na + 1} av {STEGNAVN.length}</span>
      </div>
    </div>
  );
}

export function Foten({
  tilbake,
  hoppOver,
  neste,
  nesteTekst = "Neste",
  nesteAv = false,
}: {
  tilbake?: () => void;
  hoppOver?: () => void;
  neste?: () => void;
  nesteTekst?: string;
  nesteAv?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2 mt-5">
      {tilbake ? (
        <button
          type="button"
          onClick={tilbake}
          className="text-sm font-semibold px-4 py-2.5 rounded-xl bg-surface shadow-card hover:bg-surface2 active:scale-[0.97] transition"
        >
          Tilbake
        </button>
      ) : (
        <span />
      )}
      <span className="flex items-center gap-1 sm:gap-2.5">
        {hoppOver && (
          <button
            type="button"
            onClick={hoppOver}
            className="text-sm text-dim hover:text-ink px-2.5 sm:px-3 py-2.5 transition whitespace-nowrap"
          >
            Hopp over
          </button>
        )}
        {neste && (
          <button
            type="button"
            onClick={neste}
            disabled={nesteAv}
            className="bg-accent hover:bg-accent-hover active:scale-[0.97] transition text-white text-sm font-semibold px-4 sm:px-5 py-2.5 rounded-xl whitespace-nowrap disabled:opacity-40 disabled:pointer-events-none"
          >
            {nesteTekst}
          </button>
        )}
      </span>
    </div>
  );
}

export function Kort({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-surface rounded-card shadow-card p-5 sm:p-6">{children}</div>
  );
}

export function Felt({
  id,
  merke,
  hint,
  feil = false,
  children,
}: {
  id: string;
  merke: string;
  hint?: string;
  /** Farger hinten rød. Brukes når hinten forklarer hva som er galt. */
  feil?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-xs font-semibold mb-1.5">
        {merke}
      </label>
      {children}
      {hint && (
        <div className={`text-[11.5px] mt-1.5 ${feil ? "text-bad" : "text-faint"}`}>
          {hint}
        </div>
      )}
    </div>
  );
}


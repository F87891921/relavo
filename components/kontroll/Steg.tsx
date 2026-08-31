export const STEGNAVN = [
  "Selskap",
  "Anskaffelse",
  "Saksopplysninger",
  "Tariff og HMS",
  "Egenerklæring",
  "Oppsummering",
];

/** Framdriftsstripa øverst. Passerte steg er fylt, resten er tomme. */
export function Steg({ na }: { na: number }) {
  return (
    <div className="flex gap-2 mb-7">
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
              className={`text-[11.5px] truncate transition ${
                aktiv ? "text-ink font-semibold" : "text-faint"
              }`}
            >
              {i + 1} {navn}
            </div>
          </div>
        );
      })}
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
    <div className="flex items-center justify-between mt-5">
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
      <span className="flex items-center gap-2.5">
        {hoppOver && (
          <button
            type="button"
            onClick={hoppOver}
            className="text-sm text-dim hover:text-ink px-3 py-2.5 transition"
          >
            Hopp over
          </button>
        )}
        {neste && (
          <button
            type="button"
            onClick={neste}
            disabled={nesteAv}
            className="bg-accent hover:bg-accent-hover active:scale-[0.97] transition text-white text-sm font-semibold px-5 py-2.5 rounded-xl disabled:opacity-40 disabled:pointer-events-none"
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
    <div className="bg-surface rounded-card shadow-card p-6">{children}</div>
  );
}

export function Felt({
  id,
  merke,
  hint,
  children,
}: {
  id: string;
  merke: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <label htmlFor={id} className="block text-xs font-semibold mb-1.5">
        {merke}
      </label>
      {children}
      {hint && <div className="text-[11.5px] text-faint mt-1.5">{hint}</div>}
    </div>
  );
}

export const INPUT =
  "w-full text-[13.5px] px-3 py-2.5 rounded-xl border border-border-strong bg-surface focus:outline-none focus:ring-[3px] focus:ring-accent-light focus:border-accent";

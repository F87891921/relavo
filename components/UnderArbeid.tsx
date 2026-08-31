/**
 * Midlertidig innhold for skjermbilder som ennå ikke er portet fra
 * prototypen. Sier hva siden skal inneholde, i stedet for å late som den er
 * ferdig — en tom side uten forklaring ser ut som en feil.
 */
export function UnderArbeid({
  punkter,
  kilde,
}: {
  punkter: string[];
  kilde: string;
}) {
  return (
    <div className="bg-surface rounded-card shadow-card p-6 max-w-[640px]">
      <div className="inline-flex items-center gap-2 bg-warn-bg text-warn text-[11px] font-semibold px-2.5 py-1 rounded-full mb-4">
        Ikke portet ennå
      </div>
      <p className="text-sm text-dim leading-relaxed mb-4">
        Skjermbildet finnes ferdig designet i prototypen{" "}
        <code className="text-[12px] bg-canvas px-1.5 py-0.5 rounded">{kilde}</code>,
        men er ikke bygget om til ekte kode ennå. Det skal inneholde:
      </p>
      <ul className="text-sm text-dim space-y-1.5">
        {punkter.map((p) => (
          <li key={p} className="flex gap-2.5">
            <span className="text-accent mt-[7px] w-1 h-1 rounded-full bg-accent shrink-0" />
            {p}
          </li>
        ))}
      </ul>
    </div>
  );
}

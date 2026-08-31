import { RelavoMark } from "./RelavoMark";

export function DashboardShell({
  aktivtSteg,
  children,
}: {
  aktivtSteg: string;
  children: React.ReactNode;
}) {
  const steg = [
    { navn: "Leverandører", href: "/leverandorer" },
    { navn: "Ny kontroll", href: "/ny-kontroll" },
  ];

  return (
    <div className="min-h-screen flex">
      <aside className="w-[220px] shrink-0 border-r border-border bg-surface px-4 py-5 flex flex-col">
        <div className="flex items-center gap-2 px-1 mb-8">
          <RelavoMark className="w-6 h-auto text-accent" />
          <span className="font-extrabold text-[15px] tracking-tight">Relavo</span>
        </div>
        <nav className="flex flex-col gap-0.5">
          {steg.map((s) => (
            <a
              key={s.href}
              href={s.href}
              className={`text-[13.5px] px-3 py-2 rounded-lg transition ${
                aktivtSteg === s.navn
                  ? "bg-surface2 text-accent font-semibold"
                  : "text-dim hover:bg-canvas hover:text-ink"
              }`}
            >
              {s.navn}
            </a>
          ))}
        </nav>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}

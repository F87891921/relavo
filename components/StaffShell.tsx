import Link from "next/link";
import { krevAnsatt } from "@/lib/tilgang-ansatt";
import { RelavoLogo } from "./RelavoLogo";
import { MobilMeny } from "./MobilMeny";
import type { Ordbok } from "@/lib/sprak";

/**
 * Sidemenyen for kontopanelet. Punktene følger relavo-staff.html, som er
 * skrevet på svensk — det er Relavos eget interne verktøy, mens kundedelen
 * er på norsk. Den forskjellen er bevisst og beholdes.
 */
/** bara=true betyder att punkten kräver superadmin. */
export const ANSATTMENY = [
  { id: "konton", href: "/internt" },
  { id: "attgora", href: "/internt/attgora" },
  { id: "support", href: "/internt/support" },
  { id: "kontakt", href: "/internt/kontakt" },
  { id: "leads", href: "/internt/leads" },
  { id: "offerter", href: "/internt/offerter" },
  { id: "fakturering", href: "/internt/fakturering" },
  { id: "onboarding", href: "/internt/onboarding" },
  { id: "kreditt", href: "/internt/kreditt" },
  { id: "kallor", href: "/internt/kallor" },
  { id: "marginal", href: "/internt/marginal", bara: "superadmin" },
  { id: "logg", href: "/internt/logg", bara: "superadmin" },
  { id: "team", href: "/internt/team", bara: "superadmin" },
] as const;

export async function StaffShell({
  aktivtSteg,
  children,
}: {
  aktivtSteg: string;
  children: React.ReactNode;
}) {
  const { profil, user, supabase, t } = await krevAnsatt();
  const superadmin = profil.ansatt_rolle === "superadmin";
  // Olästa notiser visas som en siffra vid «Att göra» — annars måste man gå
  // in på sidan för att få veta att det finns något där.
  const { count: olasta } = await supabase
    .from("interne_varsler")
    .select("id", { count: "exact", head: true })
    .is("lest", null);

  const meny = ANSATTMENY.filter((s) => !("bara" in s) || superadmin).map((s) => ({
    id: s.id as string,
    href: s.href,
    navn: t.ansattmeny[s.id as keyof Ordbok["ansattmeny"]],
    ...(s.id === "attgora" && olasta ? { merke: olasta } : {}),
  }));

  // Samma botten i sidomenyn och i mobillådan.
  const botten = (
    <>
      <div className="px-3 py-2 border-t border-white/15">
        <div className="text-[12.5px] font-semibold text-white truncate">
          {profil.navn ?? user.email}
        </div>
        <div className="text-[10.5px] text-white/45">
          {superadmin ? t.skall.superadmin : t.skall.personal}
        </div>
      </div>
      <Link
        href="/oversikt"
        className="text-[13px] px-3 py-2 rounded-lg text-white/60 hover:bg-white/10 hover:text-white transition block"
      >
        {t.skall.tilbakeTilKunde}
      </Link>
    </>
  );

  return (
    <div className="min-h-screen lg:flex">
      <aside className="skjul-i-utskrift hidden lg:flex w-[230px] shrink-0 border-r border-border bg-ink px-4 py-5 flex-col sticky top-0 h-screen">
        <Link href="/internt" className="block px-1 mb-2" aria-label="Relavo internt">
          <RelavoLogo className="w-[86px] h-auto text-white" />
        </Link>
        <div className="px-1 mb-7 text-[10.5px] font-bold tracking-[0.09em] uppercase text-white/40">
          {t.skall.internt}
        </div>

        <nav className="flex flex-col gap-0.5 overflow-y-auto min-h-0 flex-1">
          {meny.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              aria-current={aktivtSteg === s.id ? "page" : undefined}
              className={`text-[13px] px-3 py-2 rounded-lg transition flex items-center gap-2 ${
                aktivtSteg === s.id
                  ? "bg-white/15 text-white font-semibold"
                  : "text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              {s.navn}
              {!!s.merke && (
                <span className="ml-auto bg-accent text-white text-[10.5px] font-bold rounded-full px-1.5 min-w-[18px] text-center leading-[18px]">
                  {s.merke}
                </span>
              )}
            </Link>
          ))}
        </nav>

        <div className="shrink-0 pt-4">{botten}</div>
      </aside>

      <MobilMeny
        punkter={meny}
        aktivtSteg={aktivtSteg}
        tittel={t.skall.internt}
        tittelForSteg={t.ansattmeny[aktivtSteg as keyof Ordbok["ansattmeny"]] ?? ""}
        apneMenyen={t.skall.apneMenyen}
        lukkMenyen={t.skall.lukkMenyen}
        mork
      >
        {botten}
      </MobilMeny>

      <main className="flex-1 min-w-0">{children}</main>
    </div>
  );
}

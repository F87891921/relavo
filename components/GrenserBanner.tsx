import Link from "next/link";
import { ord } from "@/lib/sprak";
import { kjopKontroll } from "@/app/(auth)/betaling/handlinger";
import type { Grenser } from "@/lib/grenser";

/**
 * Hva planen tillater, vist der man jobber. Vises ikke for kommunene, som
 * ikke har noen grense å nærme seg.
 */
export function GrenserBanner({ g }: { g: Grenser }) {
  const t = ord().grenser;

  if (g.kontrollerIgjen !== null)
    return (
      <div
        className={`mb-5 rounded-card border px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-[13px] ${
          g.kontrollerIgjen === 0 ? "bg-warn-bg border-warn/30 text-warn" : "bg-surface border-border"
        }`}
      >
        <span>{g.kontrollerIgjen === 0 ? t.ingenIgjen : t.kontrollerIgjen.replace("{n}", String(g.kontrollerIgjen))}</span>
        <form action={kjopKontroll}>
          <button className="text-[12.5px] font-semibold px-3.5 py-2 rounded-lg bg-accent text-white hover:bg-accent-hover transition">
            {t.kjop}
          </button>
        </form>
      </div>
    );

  if (g.levMaks === null || g.levN === null) return null;

  const fullt = g.levN >= g.levMaks;
  const naer = g.levN >= g.levMaks * 0.8;
  return (
    <div
      className={`mb-5 rounded-card border px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-[13px] ${
        fullt ? "bg-bad-bg border-bad/30 text-bad" : naer ? "bg-warn-bg border-warn/30 text-warn" : "bg-surface border-border"
      }`}
    >
      <span>
        <b>{t.leverandorer.replace("{n}", String(g.levN)).replace("{maks}", String(g.levMaks))}</b>
        {fullt ? ` · ${t.fullt}` : naer ? ` · ${t.naer}` : ""}
      </span>
      {(fullt || naer) && (
        <Link href={`/kontakt?om=priser`} className="text-[12.5px] font-semibold underline">
          {t.kontakt}
        </Link>
      )}
    </div>
  );
}

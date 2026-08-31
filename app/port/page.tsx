import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { RelavoMark } from "@/components/RelavoMark";
import { KAPSEL, avtrykk } from "@/lib/portvakt";

/**
 * Sperresiden. Ligger utenfor (auth)-gruppen fordi den må kunne nås uten
 * noe som helst — det er den eneste siden middleware slipper gjennom.
 */
export default function PortSide({
  searchParams,
}: {
  searchParams: { feil?: string; neste?: string };
}) {
  async function slippInn(formData: FormData) {
    "use server";

    const fasit = process.env.SIDE_PASSORD;
    const neste = String(formData.get("neste") || "/");
    const trygg = neste.startsWith("/") && !neste.startsWith("//") ? neste : "/";

    // Er passordet ikke satt, er sperren av. Da skal ingen låses ute.
    if (!fasit) redirect(trygg);

    const gitt = String(formData.get("passord") || "");
    if (gitt !== fasit) {
      redirect(`/port?feil=1&neste=${encodeURIComponent(trygg)}`);
    }

    cookies().set(KAPSEL, await avtrykk(fasit), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    redirect(trygg);
  }

  return (
    <div className="min-h-screen flex items-start justify-center bg-surface pt-[14vh] px-4">
      <div className="w-full max-w-[368px] bg-surface rounded-2xl shadow-lift overflow-hidden">
        <div className="px-6 pt-7 pb-1 text-center">
          <RelavoMark className="w-12 h-auto mx-auto mb-3 text-accent" />
          <h1 className="text-[17px] font-semibold">Relavo</h1>
          <p className="text-[12.5px] text-dim mt-1.5 leading-relaxed">
            Siden er under utvikling og ikke åpen ennå.
          </p>
        </div>

        <form action={slippInn} className="px-6 pt-5 pb-7">
          <input type="hidden" name="neste" value={searchParams.neste ?? "/"} />
          <label htmlFor="passord" className="block text-xs font-semibold mb-1.5">
            Passord
          </label>
          <input
            id="passord"
            name="passord"
            type="password"
            required
            autoFocus
            autoComplete="current-password"
            className="w-full text-[13.5px] px-3 py-2.5 rounded-xl border border-border-strong bg-surface focus:outline-none focus:ring-[3px] focus:ring-accent-light focus:border-accent"
          />
          {searchParams.feil && (
            <div className="text-xs text-bad mt-2.5">Feil passord.</div>
          )}
          <button
            type="submit"
            className="w-full bg-accent hover:bg-accent-hover active:scale-[0.97] transition text-white text-sm font-semibold py-2.5 rounded-xl mt-4"
          >
            Slipp meg inn
          </button>
        </form>
      </div>
    </div>
  );
}

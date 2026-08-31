"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { validerOrgnr, formaterOrgnr } from "@/lib/orgnr";
import { kjorKredittsjekk } from "@/app/internt/handlinger";
import { INPUT } from "@/components/internt/Skjema";

export function Kredittsjekk() {
  const router = useRouter();
  const [tekst, setTekst] = useState("");
  const [feil, setFeil] = useState("");
  const [venter, start] = useTransition();

  const sifre = tekst.replace(/\D/g, "");
  const validering = validerOrgnr(tekst);
  const full = sifre.length === 9;

  function hint() {
    if (!sifre.length) return "Ni siffer. Kontrollsifferet valideres med modulus 11.";
    if (!full) return `${sifre.length} av 9 siffer — ${9 - sifre.length} igjen.`;
    if (!validering.ok) return validering.feil;
    return "Klar för kontroll.";
  }

  function kjor() {
    setFeil("");
    const fd = new FormData();
    fd.set("orgnr", sifre);
    start(async () => {
      const res = await kjorKredittsjekk(fd);
      if (!res.ok) setFeil(res.feil);
      else {
        setTekst("");
        router.refresh();
      }
    });
  }

  return (
    <div className="bg-surface rounded-card shadow-card p-6 mb-5">
      <h2 className="text-[15px] font-semibold mb-1">Kör kreditkontroll</h2>
      <p className="text-[12.5px] text-dim mb-4 leading-relaxed max-w-[64ch]">
        Hämtar selskapsdata från Enhetsregisteret och senaste årsredovisning
        från Regnskapsregisteret. Båda är öppna och gratis. Betalningsanmärkningar
        och skatterestanser kräver avtal och hämtas inte — de står som ej
        kontrollerade, inte som frånvaro av anmärkningar.
      </p>

      <div className="flex flex-wrap gap-3 items-start">
        <div className="min-w-[220px]">
          <input
            value={tekst}
            onChange={(e) => {
              setTekst(formaterOrgnr(e.target.value.replace(/\D/g, "").slice(0, 9)));
              setFeil("");
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter" && validering.ok && !venter) kjor();
            }}
            inputMode="numeric"
            placeholder="000 000 000"
            aria-label="Organisasjonsnummer"
            className={`${INPUT} font-mono tracking-wide ${
              full && !validering.ok ? "border-bad focus:border-bad" : ""
            }`}
          />
          <div
            className={`text-[11.5px] mt-1.5 ${full && !validering.ok ? "text-bad" : "text-faint"}`}
          >
            {hint()}
          </div>
        </div>

        <button
          type="button"
          onClick={kjor}
          disabled={!validering.ok || venter}
          className="bg-accent hover:bg-accent-hover active:scale-[0.97] transition text-white text-sm font-semibold px-5 py-2.5 rounded-xl disabled:opacity-40 disabled:pointer-events-none"
        >
          {venter ? "Kontrollerar …" : "Kör kontroll"}
        </button>
      </div>

      {feil && (
        <div className="text-xs text-bad bg-bad-bg rounded-xl px-3.5 py-2.5 mt-4">
          {feil}
        </div>
      )}
    </div>
  );
}

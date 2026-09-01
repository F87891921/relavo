"use client";

import { useOrd } from "@/components/Sprakgiver";

import { useState, useTransition } from "react";
import { Merke } from "@/components/ui";
import { settBehandlet } from "@/app/internt/handlinger";

export function MarkerBehandlet({
  id,
  behandlet,
}: {
  id: string;
  behandlet: boolean;
}) {
  const t = useOrd();
  const [av, setAv] = useState(behandlet);
  const [venter, start] = useTransition();

  if (av)
    return (
      <button
        type="button"
        disabled={venter}
        onClick={() =>
          start(async () => {
            await settBehandlet(id, false);
            setAv(false);
          })
        }
        className="disabled:opacity-50"
        title={t.internt.angre}
      >
        <Merke tone="god">{t.internt.behandlet}</Merke>
      </button>
    );

  return (
    <button
      type="button"
      disabled={venter}
      onClick={() =>
        start(async () => {
          await settBehandlet(id, true);
          setAv(true);
        })
      }
      className="text-[12.5px] text-accent hover:underline disabled:opacity-50 whitespace-nowrap"
    >
      {venter ? t.felles.lagrer : t.internt.merkBehandlet}
    </button>
  );
}

"use client";

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
        title="Ångra"
      >
        <Merke tone="god">Behandlad</Merke>
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
      {venter ? "Sparar …" : "Markera behandlad"}
    </button>
  );
}

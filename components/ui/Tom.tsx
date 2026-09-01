"use client";

import { useOrd } from "@/components/Sprakgiver";

/**
 * «Ingenting her ennå», oversatt.
 *
 * Egen liten klientkomponent i stedet for en useOrd() inne i Tabell. ui/
 * index.tsx importeres av både server- og klientkomponenter, og eksporterer
 * blant annet NOK() som kalles på serveren. Setter man «use client» på hele
 * filen, blir NOK en klientreferanse — den ser ut som en funksjon, men lar
 * seg ikke kalle. Bygget godtar det; det smeller først i nettleseren.
 */
export function Tom() {
  return <>{useOrd().felles.ingenting}</>;
}

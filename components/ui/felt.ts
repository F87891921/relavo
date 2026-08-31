/**
 * Feltstilen, ett sted. Lå tidligere som en INPUT-konstant i tre filer og
 * inline i tre til — feltene ble ulikt brede fra side til side (350, 756 og
 * 115 piksler på samme skjerm), og en endring måtte gjøres seks steder.
 *
 * Uttrykket: siden er hvit, feltet er svakt tonet. Det er feltet som skal
 * skille seg ut, ikke flaten rundt. På fokus blir feltet hvitt og løftes med
 * en ring — det som er i bruk er lysest.
 *
 * Breddetaket gjør at felt står like brede uansett hvor bredt kortet er. I
 * en smal kolonne krymper de under taket av seg selv.
 */
export const FELT =
  "w-full max-w-[380px] text-[13.5px] px-3 py-2.5 rounded-xl bg-canvas border border-border " +
  "transition placeholder:text-faint " +
  "focus:outline-none focus:bg-surface focus:border-accent focus:ring-[3px] focus:ring-accent-light " +
  "hover:border-border-strong disabled:opacity-60";

/** Samme stil. Beholdt som navn fordi flere filer allerede importerer det. */
export const FELT_FULL = FELT;

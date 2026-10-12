import { Veiviser } from "./Veiviser";

/**
 * Registreringen. Selve skjemaet er et tre-stegs oppsett (hvem, om dem,
 * konto) i Veiviser.tsx; planen fra prisfinneren på forsiden sendes med
 * som ?plan= og hopper over første steg for selskap.
 */
export default function RegistrerSide({
  searchParams,
}: {
  searchParams: { plan?: string };
}) {
  return <Veiviser forvalgt={searchParams.plan} />;
}

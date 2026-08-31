import type { SVGProps } from "react";
import { RELAVO_PATH } from "./relavo-path";

/**
 * R-merket alene, uten ordet "Relavo" som tekst. Farge styres av
 * currentColor, så den kan brukes både i den lilla og i hvit variant.
 */
export function RelavoMark(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 327 312" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path fillRule="evenodd" clipRule="evenodd" fill="currentColor" d={RELAVO_PATH} />
    </svg>
  );
}

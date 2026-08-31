import type { SVGProps } from "react";
import { RELAVO_PATH } from "./relavo-path";

/**
 * Full ordmerke — R-merket pluss ordet "Relavo". Brukes i landingssidens
 * toppnavigasjon og bunn. Merket er alltid aksentfarget; ordet arver
 * tekstfargen, så logoen fungerer også på mørk flate.
 */
export function RelavoLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 1033 312"
      role="img"
      aria-label="Relavo"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path fillRule="evenodd" fill="#654b70" d={RELAVO_PATH} />
      <text
        x="404"
        y="241"
        fontFamily="var(--font-inter), Arial, Helvetica, sans-serif"
        fontWeight="800"
        fontSize="190"
        letterSpacing="-7"
        fill="currentColor"
      >
        Relavo
      </text>
    </svg>
  );
}

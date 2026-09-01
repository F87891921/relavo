import { ord } from "@/lib/sprak";
import { Chain } from "./Chain";

/**
 * Funksjonsrutene viser ekte UI-fragment, ikke ikoner. Fragmentene er de
 * samme komponentene dashbordet bruker, i miniatyr.
 */
const LOVKRAV = [
  { ref: "§ 5e", tekst: "Skatt og merverdiavgift", status: "ok" as const },
  { ref: "§ 5g", tekst: "Lønn via bank", status: "ok" as const },
  { ref: "§ 5h", tekst: "Lærlingekrav", status: "ok" as const },
  { ref: "§ 5k", tekst: "Høyst to ledd", status: "no" as const },
];

export function Plattform() {
  const s9 = ord().skjermbilde;
  const t = ord().landing.plattform;

  return (
    <section className="sec" id="plattform">
      <div className="wrap">
        <div className="sec-head">
          <div className="eyebrow">Plattform</div>
          <h2 className="statement">
            {t.tittel}{" "}
            <span>{t.raskt}</span>
          </h2>
        </div>

        <div className="feats">
          <div className="feat">
            <div className="feat-t">{t.kjede}</div>
            <p className="feat-d">
              {t.kjedeD}
            </p>
            <div className="feat-ui">
              <Chain />
            </div>
          </div>

          <div className="feat">
            <div className="feat-t">{t.krav}</div>
            <p className="feat-d">
              {t.kravD}
            </p>
            <div className="feat-ui">
              <div className="laws">
                {LOVKRAV.map((krav) => (
                  <div
                    key={krav.ref}
                    className={krav.status === "no" ? "law fail" : "law"}
                  >
                    <span className="law-ref">{krav.ref}</span>
                    <span className="law-t">{krav.tekst}</span>
                    <span className={`badge ${krav.status}`}>
                      <i />
                      {krav.status === "ok" ? "Oppfylt" : "Brudd"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="feats-3">
          <div className="feat feat-label">
            <div className="eyebrow">{t.eyebrow}</div>
          </div>

          <div className="feat">
            <div className="feat-t">{t.laveTilbud}</div>
            <p className="feat-d">
              {t.laveTilbudD}
            </p>
            <div className="feat-ui">
              <div className="bud">
                <div className="bud-r lav">
                  <span className="bud-n">Solstrand Renhold</span>
                  <span className="bud-s mono">21,4 mill</span>
                  <span className="bud-a">−39 %</span>
                </div>
                <div className="bud-r">
                  <span className="bud-n">Clean Nord</span>
                  <span className="bud-s mono">33,8 mill</span>
                  <span className="bud-a" />
                </div>
              </div>
            </div>
          </div>

          <div className="feat">
            <div className="feat-t">{t.overvaking}</div>
            <p className="feat-d">
              {t.overvakingD}
            </p>
            <div className="feat-ui">
              <div className="tidslinje">
                <div className="tl-r">
                  <span className="tl-d" />
                  <span className="tl-t">{s9.nyDagligLeder}</span>
                  <span className="tl-n">24. aug</span>
                </div>
                <div className="tl-r na">
                  <span className="tl-d" />
                  <span className="tl-t">{s9.tredjeLedd}</span>
                  <span className="tl-n">i dag</span>
                </div>
              </div>
            </div>
          </div>

          <div className="feat">
            <div className="feat-t">{t.rapport}</div>
            <p className="feat-d">
              {t.rapportD}
            </p>
            <div className="feat-ui">
              <div className="rcpt">
                <div className="rcpt-h">
                  <b>{s9.leverandorkontroll}</b>
                  <span className="mono rcpt-dato">29. aug 2026</span>
                </div>
                <div className="rcpt-r">
                  <span>Enhetsregisteret</span>
                  <span>{s9.svar}</span>
                </div>
                <div className="rcpt-r">
                  <span>{s9.espdEgenerklaering}</span>
                  <span>{s9.vedlegg}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

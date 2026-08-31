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
  return (
    <section className="sec" id="plattform">
      <div className="wrap">
        <div className="sec-head">
          <div className="eyebrow">Plattform</div>
          <h2 className="statement">
            Én kontroll, alle registre.{" "}
            <span>Svaret kommer før du rekker å åpne neste fane.</span>
          </h2>
        </div>

        <div className="feats">
          <div className="feat">
            <div className="feat-t">Leverandørkjeden, hele veien ned</div>
            <p className="feat-d">
              § 5k tillater høyst to ledd underleverandører i bygg, anlegg og
              renhold. Legg inn kjeden du har, så flagges overskridelsen med en
              gang — og du får de to vanlige utveiene.
            </p>
            <div className="feat-ui">
              <Chain />
            </div>
          </div>

          <div className="feat">
            <div className="feat-t">Hvert krav som en kryssbar linje</div>
            <p className="feat-d">
              Rapporten følger loven punkt for punkt, med samme
              paragrafhenvisning du siterer i anskaffelsesprotokollen.
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
            <div className="eyebrow">Flere funksjoner</div>
          </div>

          <div className="feat">
            <div className="feat-t">Unormalt lave tilbud</div>
            <p className="feat-d">
              Avviket beregnes mot de øvrige tilbudene, og du får et utkast til
              redegjørelseskravet § 24-9 pålegger deg å sende.
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
            <div className="feat-t">Løpende overvåking</div>
            <p className="feat-d">
              Konkurs, tvangsavvikling og nye anmerkninger fanges opp samme dag
              de registreres, ikke ved neste kontroll.
            </p>
            <div className="feat-ui">
              <div className="tidslinje">
                <div className="tl-r">
                  <span className="tl-d" />
                  <span className="tl-t">Ny daglig leder registrert</span>
                  <span className="tl-n">24. aug</span>
                </div>
                <div className="tl-r na">
                  <span className="tl-d" />
                  <span className="tl-t">Tredje ledd lagt til i kjeden</span>
                  <span className="tl-n">i dag</span>
                </div>
              </div>
            </div>
          </div>

          <div className="feat">
            <div className="feat-t">Rapport som holder</div>
            <p className="feat-d">
              Hver kjøring lagres uendret med kilde og dato på hver linje. Det
              som ikke er kontrollert står oppført som ikke kontrollert.
            </p>
            <div className="feat-ui">
              <div className="rcpt">
                <div className="rcpt-h">
                  <b>Leverandørkontroll</b>
                  <span className="mono rcpt-dato">29. aug 2026</span>
                </div>
                <div className="rcpt-r">
                  <span>Enhetsregisteret</span>
                  <span>Svar</span>
                </div>
                <div className="rcpt-r">
                  <span>ESPD-egenerklæring</span>
                  <span>Vedlegg</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

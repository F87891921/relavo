# Relavo – fakturamall

Mallen är skriven för att kunna användas i vilket fakturaprogram som helst. Fälten är de som en norsk faktura måste innehålla (bokføringsforskriften § 5-1-1 och merverdiavgiftsloven § 15-x). Kontrollera slutversionen med revisorn.

## Avsändare (fast text i mallens sidhuvud)

LOD TECH AB NUF, org.nr 938 518 858 — norsk filial av LOD TECH AB, org.nr 559471-0419
(lägg bara till "MVA" efter 938 518 858 när NUF är momsregistrerat i Norge)
[Adress]
[E-post: hej@lodtech.se]
Produktnamn: Relavo

## Kund (fylls i per faktura)

- Kundens namn och organisasjonsnummer
- Fakturaadress
- Referens: **Relavo** + kundens referanse (fylls i av kunden i onboarding)
- Fakturanummer: löpenummer per år, till exempel 2026-0001
- Fakturadato och forfallsdato (30 dagar som standard)

## Rader

| Beskrivelse | Antall | Pris | MVA |
|---|---|---|---|
| Relavo [Start / Vekst / Bygg / Kommune M/L/XL] – abonnement [12/24/36] måneder, [fra dato] til [til dato] | 1 | enligt priseringen | 25 % |

Texten på raden ska alltid säga vilken period och vilken plan fakturan avser. Priserna ligger i `lib/priser.ts`.

## Fotnote (fast text längst ned)

Betalingsbetingelser: 30 dager netto. Ved forsinket betaling beregnes forsinkelsesrente etter forsinkelsesrenteloven.
Relavo er et beslutningsstøtte. Den endelige vurderingen gjøres av kunden.
Betaling til: [bankgiro / IBAN / BIC] · Merk betalingen med fakturanummeret.

## Före första fakturan – tre saker att avgöra

1. **Vilket system skapar fakturan?** Fortnox är ett svenskt bokföringsprogram (SEK, svensk kontoplan, svensk momsredovisning). En norsk NUF som debiterar NOK med norsk moms 25 % ska redovisa moms i Norge. Fråga revisorn om NUF:et ska bokföras i ett norskt system (Fiken, Tripletex, Visma eller liknande) i stället för i det svenska Fortnox-bolaget.
2. **Momsregistrering.** Norsk moms på fakturan förutsätter att NUF:et är registrerat i MVA-registeret. Registreringsplikt gäller från 50 000 NOK i omsättning på 12 månader. Frivillig registrering går.
3. **Kommuner kräver EHF – löst.** Fortnox hanterar Peppol och EHF (Peppol BIS Billing 3) automatiskt i sitt inbyggda e-fakturaflöde, enligt besked från Fortnox. Att tänka på vid första kommunfakturan: fyll i kundens riktiga organisasjonsnummer (9 siffror) och kundens referens, eftersom de styr vart fakturan levereras och hur kommunen konterar den. Testa gärna med en liten testfaktura först.

## Öppen punkt

Punkt 1 och 2 ovan (var NUF:et bokförs och om norsk moms 25 % kan redovisas) avgörs av revisorn. Mallens rader och texter gäller oavsett svar.

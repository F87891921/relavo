import type { Ordbok } from "./felles";

/**
 * English. The Norwegian statutes keep their Norwegian names, with a short
 * gloss the first time they appear: «anskaffelsesforskriften § 24-9» is the
 * name of a Norwegian regulation, not a phrase. Translate it and the reader
 * can no longer look it up — which is the whole point of citing it.
 */
export const en: Ordbok = {
  sprak: { velg: "Language", norsk: "Norwegian", svensk: "Swedish", engelsk: "English" },

  meny: {
    oversikt: "Overview",
    nyKontroll: "New check",
    bulk: "Bulk check",
    kjede: "Supply chain",
    tilbud: "Abnormally low tenders",
    anskaffelser: "Procurements",
    leverandorer: "Suppliers",
    jav: "Conflicts of interest",
    espd: "ESPD",
    support: "Support",
    konto: "Account",
  },

  ansattmeny: {
    konton: "Accounts",
    attgora: "To do",
    support: "Support",
    kontakt: "Contact",
    leads: "Leads",
    offerter: "Quotes",
    fakturering: "Invoicing",
    onboarding: "Onboarding",
    kreditt: "Credit checks",
    kallor: "Source health",
    marginal: "Margin",
    logg: "Access log",
    team: "Team and access",
  },

  skall: {
    kontoenDin: "Your account",
    loggUt: "Sign out",
    loggerUt: "Signing out …",
    relavoInternt: "Relavo internal →",
    tilbakeTilKunde: "← Back to the customer view",
    internt: "Internal",
    apneMenyen: "Open the menu",
    lukkMenyen: "Close the menu",
    personal: "Staff",
    superadmin: "Superadmin",
  },

  felles: {
    lagre: "Save",
    lagrer: "Saving …",
    avbryt: "Cancel",
    tilbake: "Back",
    neste: "Next",
    hoppOver: "Skip",
    sok: "Search",
    vis: "Show",
    skjul: "Hide",
    apne: "Open",
    sender: "Sending …",
    henter: "Loading …",
    valgfritt: "optional",
    ingenting: "Nothing here yet.",
    status: "Status",
    endreStatus: "Click to change status",
  },

  sider: {
    oversikt: {
      tittel: "Overview",
      tekst: "Where you stand on the duty to verify, and what needs you today.",
    },
    nyKontroll: {
      tittel: "New check",
      tekst:
        "Six steps, three of them optional. The result is stored unchanged as evidence that the duty to verify under anskaffelsesloven § 5i has been met.",
    },
    bulk: {
      tittel: "Bulk check",
      tekst:
        "Paste the organisation numbers for the whole portfolio and check them all in one go.",
    },
    kjede: {
      tittel: "Supply chain",
      tekst:
        "§ 5k allows at most two tiers of subcontractors in construction, civil engineering and cleaning. Breaches are flagged — and the two lawful ways out are to cut the tier or seek an exemption from the contracting authority.",
    },
    tilbud: {
      tittel: "Abnormally low tenders",
      tekst:
        "The deviation is measured against the median of the other tenders. Where a tender is abnormally low, § 24-9 requires you to ask the tenderer to explain it in writing before you may reject it.",
    },
    anskaffelser: {
      tittel: "Procurements",
      tekst:
        "The contracts the checks belong to. The case number here is the one you enter in the procurement record.",
    },
    leverandorer: {
      tittel: "Suppliers",
      tekst: "Every supplier you have checked, with the latest known status.",
    },
    jav: {
      tittel: "Conflicts of interest",
      tekst:
        "Board members at the supplier are cross-checked against the people taking part in the procurement. A match is a warning of possible disqualification under forvaltningsloven § 6, not a conclusion.",
    },
    espd: {
      tittel: "ESPD and self-declarations",
      tekst:
        "The self-declaration covers the part of the qualification assessment the registers cannot answer. Where one is missing it can be requested afterwards under § 23-5 — and the deadline is tracked here.",
    },
    support: {
      tittel: "Support",
      tekst:
        "Raise a ticket and follow the reply here. Choose notifications and you get an email when the ticket is answered or changes status.",
    },
    konto: {
      tittel: "Account settings",
      tekst:
        "Your own details, the organisation you belong to, and who has access.",
    },
  },

  ansattsider: {
    konton: {
      tittel: "Accounts",
      tekst: "Every customer account, the plan they are on and how much of the quota they have used.",
    },
    attgora: {
      tittel: "To do",
      tekst:
        "What needs a person today, drawn from invoices, quotes, leads and source health. Red is urgent.",
    },
    support: {
      tittel: "Support",
      tekst:
        "Tickets from every account. Reply here and it goes straight to the customer, and the ticket moves to Waiting on the customer.",
    },
    kontakt: {
      tittel: "Contact",
      tekst:
        "Messages from the contact form on the landing page. Mark as handled once someone has replied.",
    },
    leads: {
      tittel: "Leads",
      tekst:
        "People who are interested but not yet customers. The next-step column is what decides whether something falls through the cracks.",
    },
    offerter: {
      tittel: "Quotes",
      tekst:
        "Quotes sent, what they are worth and when they expire. Search for the customer's name and the organisation number and contact details fill themselves in.",
    },
    fakturering: {
      tittel: "Invoicing",
      tekst:
        "Invoices per account, with due date and status. The invoice number is assigned automatically, running per year.",
    },
    onboarding: {
      tittel: "Onboarding",
      tekst:
        "Where each customer stands in getting started. An account counts as live once it has run its first check, not when the contract is signed.",
    },
    kreditt: {
      tittel: "Credit checks",
      tekst:
        "Checks on customers and prospective customers before we invoice. Every run is stored unchanged with a timestamp, so it can be retrieved later.",
    },
    kallor: {
      tittel: "Source health",
      tekst:
        "Response times, error rates and cost per register. If a source is down, the customer's report should say so rather than keep quiet about it.",
    },
    marginal: {
      tittel: "Margin",
      tekst:
        "What each account brings in against what the register lookups cost us. Accounts running at a loss are shown in red.",
    },
    logg: {
      tittel: "Access log",
      tekst:
        "Who on our side has opened which customer's data, and why. The log should be showable to the customer without us having to tidy it first.",
    },
    team: {
      tittel: "Team and access",
      tekst:
        "Who works here and what each person may see. Access to read customer data is separate from access to change settings — one does not follow from the other.",
    },
  },

  landing: {
    nav: { plattform: "Platform", regelverk: "The rules", priser: "Pricing", sporsmal: "Questions", loggInn: "Sign in", komIGang: "Get started" },
    hero: {
      nytt: "New",
      pille: "in force from 1 July 2026 →",
      tittel: "The check you have to do. The proof you have to keep.",
      lead: "Relavo pulls company data, tax arrears and payment defaults, maps how deep the supply chain actually runs, and stores the result as evidence that the duty to verify under § 5i has been met.",
      sePriser: "See pricing",
      note: "From 590 NOK per check. No lock-in.",
    },
    kilder: { byggerPa: "Built on" },
    regelverk: {
      eyebrow: "The rules",
      tittel: "One amendment, four numbers that matter.",
      undertittel: "From 1 July 2026 the duty to verify is explicit.",
      tall: [
        "tiers of subcontractors is the ceiling in construction, civil engineering and cleaning under § 5k",
        "median for a lookup against Enhetsregisteret, the Norwegian company register",
        "registers gathered into one report, with source and date on every line",
        "requires that the check can be documented afterwards, not merely carried out",
      ],
    },
    plattform: {
      eyebrow: "More features",
      raskt: "The answer arrives before you can open the next tab.",
      kjede: "The supply chain, all the way down",
      krav: "Every requirement as a line you can tick",
      laveTilbud: "Abnormally low tenders",
      overvaking: "Continuous monitoring",
      tittel: "One check, every register.",
      kjedeD: "§ 5k allows at most two tiers of subcontractors in construction, civil engineering and cleaning. Enter the chain you have and any breach is flagged at once — along with the two usual ways out.",
      kravD: "The report follows the law point by point, citing the same provisions you quote in the procurement record.",
      laveTilbudD: "The deviation is calculated against the other tenders, and you get a draft of the written explanation § 24-9 requires you to request.",
      overvakingD: "Bankruptcy, compulsory dissolution and new payment defaults are caught the day they are registered, not at the next check.",
      rapportD: "Every run is stored unchanged with source and date on each line. What has not been checked is listed as not checked.",
      rapport: "A report that holds up",
    },
    priser: {
      eyebrow: "Pricing",
      tittel: "One price, the whole report.",
      undertittel: "No per-lookup add-ons and no surprises on the invoice.",
      vanligst: "Most common",
      planer: [
        { navn: "Supplier check", enhet: "NOK", beskrivelse: "One check, full report as PDF. No subscription.", knapp: "Run one check", punkter: ["Company data and roles", "Tax, VAT and payment defaults", "Chain check against § 5k", "Report as PDF"] },
        { navn: "Standard", enhet: "NOK/month", beskrivelse: "Continuous monitoring of the suppliers in your portfolio.", knapp: "Start Standard", punkter: ["Everything in the single check", "Every source in every check", "Daily monitoring", "Bulk checks and procurements", "Assessment of low tenders"] },
        { navn: "Enterprise", enhet: "NOK/month", beskrivelse: "Several entities under one agreement, with an API.", knapp: "Start Enterprise", punkter: ["Everything in Standard", "Several entities and workspaces", "API access", "A named contact", "Data processing agreement"] },
      ],
    },
    faq: {
      eyebrow: "Questions",
      tittel: "What people ask first.",
      sporsmal: [
        { q: "Do you check whether someone has a criminal conviction?", a: "No, and no commercial provider can. Under personopplysningsloven § 11, processing data on criminal convictions is in practice reserved for public authorities, and Lovdata offers no machine access to court decisions. We check companies, not individuals. That part of the qualification assessment is covered by the supplier's ESPD self-declaration, which is stored as an attachment to the check." },
        { q: "Are there add-ons beyond the subscription?", a: "No. The price covers the finished report, however many registers it draws on. You are buying the assessment and the documentation, not individual lookups, and the invoice looks the same every month." },
        { q: "Does the report hold up as evidence under § 5i?", a: "Every run is stored unchanged with the time, source and result on each line, and can be retrieved later. Sources we got no answer from are listed as not checked rather than left out — a report that stays quiet about its gaps is worse than no report." },
        { q: "We are based in Sweden. Does it work?", a: "Relavo is built for Norwegian organisation numbers and Norwegian rules. The core of the assessment follows the same EU directive across the EEA, but the data sources and the statutes are Norwegian." },
      ],
    },
    close: {
      tittel: "How deep is the chain in your largest contract?",
      tekst: "Run one check and see. You do not need a subscription to try it.",
      snakkMedOss: "Talk to us",
    },
    foot: {
      tekst: "Relavo checks companies, not individuals. Data on criminal convictions is not processed.",
      vilkar: "Terms",
      personvern: "Privacy",
      cookies: "Cookies",
      kontakt: "Contact",
    },
  },
  auth: {
    loggInn: "Sign in",
    undertittel: "Supplier vetting for public procurement",
    epost: "Email",
    passord: "Password",
    eller: "or",
    medMicrosoft: "Sign in with Microsoft",
    kommer: "coming",
    loggerInn: "Signing in …",
    tofaktor: "Two-factor",
    engangskode: "Enter the code your app shows",
    bekreft: "Confirm",
    bekrefter: "Confirming …",
  },
};

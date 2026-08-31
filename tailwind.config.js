/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      // Samme palett som prototypene i relavo-landing.html / reelio-app.html.
      // Endres denne, følg med i begge steder til appen har erstattet dem.
      colors: {
        surface: "#ffffff",
        canvas: "#f8f7f9",
        surface2: "#f1ecf3",
        border: "rgba(40,31,42,0.14)",
        "border-strong": "rgba(40,31,42,0.22)",
        ink: "#1d1d1f",
        dim: "#86868b",
        faint: "rgba(29,29,31,0.5)",
        accent: {
          DEFAULT: "#654b70",
          hover: "#563f60",
          light: "rgba(101,75,112,0.08)",
        },
        good: { DEFAULT: "#1f8a5b", bg: "rgba(31,138,91,0.10)" },
        warn: { DEFAULT: "#b96b1f", bg: "rgba(185,107,31,0.10)" },
        bad: { DEFAULT: "#c43b3b", bg: "rgba(196,59,59,0.10)" },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "-apple-system", "sans-serif"],
        mono: ["var(--font-plex-mono)", "ui-monospace", "monospace"],
      },
      borderRadius: {
        card: "14px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(40,31,42,0.05), 0 2px 10px rgba(40,31,42,0.05)",
        // Løfter et kort tydelig fra hvit bakgrunn, uten å legge en flate bak
        // det. Samme skygge som innloggingsmodalen hadde i prototypen.
        lift: "0 1px 2px rgba(40,31,42,0.05), 0 24px 60px rgba(40,31,42,0.18)",
      },
    },
  },
  plugins: [],
};

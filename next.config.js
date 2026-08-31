/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Lar verifiseringsbygg skrive til en egen mappe, så de ikke ødelegger
  // dev-serverens cache. Uten dette feiler nettleseren med
  // «__webpack_require__.n is not a function» etter et build under dev.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

module.exports = nextConfig;

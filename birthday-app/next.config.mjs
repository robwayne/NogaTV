/** @type {import('next').NextConfig} */

// GitHub Pages serves this repo's site from /eventticketmaker, so the export
// needs a base path there and directory-style URLs. The artifact preview and
// a Vercel deploy both sit at the root and want neither.
const basePath = process.env.GITHUB_PAGES ? "/eventticketmaker" : "";

const nextConfig = {
  // `STATIC_EXPORT=1 npm run build` emits a plain static site into out/.
  // Normal dev and builds are unaffected.
  ...(process.env.STATIC_EXPORT
    ? {
        output: "export",
        images: { unoptimized: true },
        ...(process.env.GITHUB_PAGES
          ? { basePath, assetPrefix: basePath, trailingSlash: true }
          : {}),
      }
    : {}),
};

export default nextConfig;

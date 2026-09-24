/** @type {import('next').NextConfig} */

// GitHub Pages serves a project site from /<repo-name>, so the export needs a
// base path there and directory-style URLs. Taking the name from
// GITHUB_REPOSITORY (which Actions always sets) means renaming the repository
// moves the site without touching this file. A <user>.github.io repository is
// served from the root and wants no base path at all.
const repo = process.env.GITHUB_REPOSITORY?.split("/")[1] ?? "";
const basePath = process.env.GITHUB_PAGES && repo && !repo.endsWith(".github.io") ? `/${repo}` : "";

const nextConfig = {
  // `STATIC_EXPORT=1 npm run build` emits a plain static site into out/.
  // Normal dev and builds are unaffected.
  ...(process.env.STATIC_EXPORT
    ? {
        output: "export",
        images: { unoptimized: true },
        ...(process.env.GITHUB_PAGES ? { basePath, assetPrefix: basePath, trailingSlash: true } : {}),
      }
    : {}),
};

export default nextConfig;

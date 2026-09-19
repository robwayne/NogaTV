/** @type {import('next').NextConfig} */
const nextConfig = {
  // `STATIC_EXPORT=1 npm run build` emits a plain static site into out/, which
  // is what gets published for the shareable preview. Normal dev and builds
  // are unaffected.
  ...(process.env.STATIC_EXPORT ? { output: "export", images: { unoptimized: true } } : {}),
};

export default nextConfig;

/**
 * STATIC_EXPORT=1 builds a fully static site (for GitHub Pages) into ./out;
 * BASE_PATH sets the subpath when hosted at username.github.io/<repo>.
 * Without those env vars this stays a normal Next.js server build (Vercel).
 */
const isExport = process.env.STATIC_EXPORT === "1";

/** @type {import('next').NextConfig} */
const nextConfig = {
  ...(isExport
    ? {
        output: "export",
        trailingSlash: true,
        basePath: process.env.BASE_PATH || "",
      }
    : {}),
  images: {
    // Add remotePatterns here if you later host photos on an external CDN.
    // Static exports have no image-optimization server.
    unoptimized: isExport,
  },
};

export default nextConfig;

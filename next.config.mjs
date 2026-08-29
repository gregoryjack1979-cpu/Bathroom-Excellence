/** @type {import('next').NextConfig} */
const nextConfig = {
  // Add remotePatterns here if you later host photos on an external CDN.
  images: {},
  async redirects() {
    // The flagship Shower Remodels experience lives at "/".
    return [{ source: "/shower-remodels", destination: "/", permanent: true }];
  },
};

export default nextConfig;

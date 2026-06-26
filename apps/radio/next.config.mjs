/** @type {import('next').NextConfig} */
// Standalone — no monorepo transpilePackages; commerce logic is vendored under lib/.
const nextConfig = {
  output: "standalone",
};

export default nextConfig;

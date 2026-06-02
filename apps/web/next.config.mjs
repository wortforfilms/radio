/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@runtime", "@graph", "@search", "@shared"]
};

export default nextConfig;

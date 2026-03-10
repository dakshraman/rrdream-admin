import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/OnlineImages/:path*",
        destination: "http://localhost:3002/OnlineImages/:path*",
      }
    ];
  },
  reactStrictMode: true,
  compress: true, // enable gzip/brotli compression
  output: "standalone",

  // Tree-shake large icon/chart packages — cuts JS bundle size significantly
  experimental: {
    optimizePackageImports: ["lucide-react", "recharts"],
  },

  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

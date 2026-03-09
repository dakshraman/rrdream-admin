import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/OnlineImages/:path*",
        destination: "http://localhost:3002/OnlineImages/:path*",
      },
      {
        source: "/api/:path*",
        destination: process.env.API_URL
          ? `${process.env.API_URL}/:path*`
          : "https://game.rrdream.in/api/:path*",
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

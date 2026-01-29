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
        destination: "https://game.rrdream.in/api/:path*",
      }
    ];
  },
  reactStrictMode: true,
  // swcMinify: true,
  output: "standalone",

  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;

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
          : process.env.NODE_ENV === "development"
            ? "https://game.rrdream.in/api/:path*"
            : "http://localhost:3002/api/:path*",
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

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/profile",
        destination: "/account",
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: "/account",
        destination: "https://hishab-nikash-delta.vercel.app/",
      },
      {
        source: "/account/:path*",
        destination: "https://hishab-nikash-delta.vercel.app/:path*",
      },
    ];
  },
};

export default nextConfig;

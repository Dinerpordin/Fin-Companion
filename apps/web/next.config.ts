import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/cashbook",
        destination: "https://hishab-nikash-delta.vercel.app/",
        permanent: false,
      },
      {
        source: "/account",
        destination: "https://hishab-nikash-delta.vercel.app/",
        permanent: false,
      },
      {
        source: "/profile",
        destination: "https://hishab-nikash-delta.vercel.app/",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;

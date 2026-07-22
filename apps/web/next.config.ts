import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/profile",
        destination: "/cashbook",
        permanent: true,
      },
      {
        source: "/account",
        destination: "/cashbook",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

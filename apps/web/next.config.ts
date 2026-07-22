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
};

export default nextConfig;

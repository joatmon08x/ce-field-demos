import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1"],
  async redirects() {
    return [
      { source: "/workflows", destination: "/runbooks/101", permanent: false },
      {
        source: "/workflows/:slug",
        destination: "/runbooks/commands/:slug",
        permanent: false,
      },
      { source: "/analysis", destination: "/runbooks/101", permanent: false },
      { source: "/analysis/:path*", destination: "/runbooks/101", permanent: false },
    ];
  },
};

export default nextConfig;

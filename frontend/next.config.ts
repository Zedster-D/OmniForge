import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const rawBackend = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
    const backendUrl = rawBackend.startsWith("http://") || rawBackend.startsWith("https://")
      ? rawBackend.replace(/\/+$/, "")
      : `https://${rawBackend.replace(/\/+$/, "")}`;

    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;

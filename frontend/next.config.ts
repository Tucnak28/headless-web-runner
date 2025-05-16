import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  allowedDevOrigins: [
    "http://192.168.0.172:3000",
  ],
};

export default nextConfig;

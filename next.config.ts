import type { NextConfig } from "next";
import {
  appSecurityHeaders,
  developmentSecurityHeaders,
} from "./security-headers";

const isDev = process.env.NODE_ENV === "development";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  turbopack: {
    root: import.meta.dirname,
  },
  experimental: {
    optimizePackageImports: [
      "@mui/material",
      "@mui/icons-material",
      "@mui/material-nextjs",
    ],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: isDev ? developmentSecurityHeaders : appSecurityHeaders,
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "puppeteer-core",
    "@sparticuz/chromium",
    "@react-pdf/renderer",
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('puppeteer');
    }
    return config;
  },
};

export default nextConfig;

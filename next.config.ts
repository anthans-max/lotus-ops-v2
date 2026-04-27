import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    "puppeteer-core",
    "@sparticuz/chromium",
    "@react-pdf/renderer",
  ],
  outputFileTracingIncludes: {
    "/api/pdf/invoice/[id]": ["./node_modules/@sparticuz/chromium/**/*"],
    "/api/pdf/contract/[id]": ["./node_modules/@sparticuz/chromium/**/*"],
  },
  turbopack: {},
  experimental: {
    serverActions: {
      bodySizeLimit: "10mb",
    },
  },
};

export default nextConfig;

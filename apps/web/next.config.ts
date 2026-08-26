import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@juridico-ia/contracts", "@juridico-ia/design-system"],
  poweredByHeader: false,
};

export default nextConfig;

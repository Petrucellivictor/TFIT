import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@tfit/types", "@tfit/validation", "@tfit/database"],
};

export default nextConfig;

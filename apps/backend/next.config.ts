import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@tfit/types",
    "@tfit/validation",
    "@tfit/database",
    "@tfit/fitness-engine",
    "@tfit/ai",
    "@tfit/gamification",
    "@tfit/social",
  ],
};

export default nextConfig;

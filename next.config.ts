import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true, // ✅ ESLint 오류가 있어도 빌드가 진행됨
  },
  reactStrictMode: true,

  images: {
    unoptimized: true, // next/image 사용 시 필요
  },
};

export default nextConfig;

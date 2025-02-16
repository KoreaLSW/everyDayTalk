import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "1mb", // ✅ 요청 본문 크기 제한 (필요 시 조절 가능)
      allowedOrigins: ["*"], // ✅ 모든 도메인 허용
    },
  },
  eslint: {
    ignoreDuringBuilds: true, // ✅ ESLint 오류가 있어도 빌드가 진행됨
  },
  reactStrictMode: true,

  images: {
    unoptimized: true, // next/image 사용 시 필요
  },
};

export default nextConfig;

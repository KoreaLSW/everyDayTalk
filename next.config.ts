import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // next/image 사용 시 필요
  },
};

export default nextConfig;

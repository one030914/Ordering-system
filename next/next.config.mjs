/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    reactCompiler: true,
  },
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      {
        protocol: "https",
        hostname: "avatars.githubusercontent.com",
      },
      {
        protocol: "https",
        hostname: "cdn.pixabay.com", // ✅ 你圖片的主機
      },
      // 如果你有使用 Supabase 圖片，也要指定具體的網域
      ...(process.env.NEXT_SUPABASE_IMAGE_REMOTE_PATTERN
        ? [
            {
              protocol: "https",
              hostname: process.env.NEXT_SUPABASE_IMAGE_REMOTE_PATTERN,
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;

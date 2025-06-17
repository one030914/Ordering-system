/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        reactCompiler: true,
    },
    reactStrictMode: true,
    images: {
        remotePatterns: [
            {
                hostname: "lh3.googleusercontent.com",
            },
            {
                hostname: "avatars.githubusercontent.com",
            },
            {
                hostname: process.env.NEXT_SUPABASE_IMAGE_REMOTE_PATTERN,
            },
        ],
    },
};

export default nextConfig;

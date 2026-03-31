import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow PostHog host for server-side fetches
  experimental: {
    // Needed if you ever use server actions or streaming
  },
};

export default nextConfig;

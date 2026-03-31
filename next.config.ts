import type { NextConfig } from "next";
import createNextIntl from "next-intl/plugin";

const withNextIntl = createNextIntl();

const nextConfig: NextConfig = {
  // Allow PostHog host for server-side fetches
  experimental: {
    // Needed if you ever use server actions or streaming
  },
};

export default withNextIntl(nextConfig);

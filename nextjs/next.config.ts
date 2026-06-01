import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

const config: NextConfig = {
  reactCompiler: true,
  typedRoutes: true,
  cacheComponents: true,

  // Allow cross-origin iframe embedding from the Astro app
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "ALLOWALL",
          },
          {
            key: "Content-Security-Policy",
            // Allow embedding from ariakit.com/ariakit.org domains and workers.dev
            value:
              "frame-ancestors 'self' https://ariakit.com https://*.ariakit.com https://ariakit.org https://*.ariakit.org https://*.workers.dev http://localhost:*",
          },
        ],
      },
    ];
  },
};

export default async function nextConfig(): Promise<NextConfig> {
  await initOpenNextCloudflareForDev();
  return config;
}

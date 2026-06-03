import { join } from "node:path";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

const config: NextConfig = {
  reactCompiler: true,
  typedRoutes: true,
  cacheComponents: true,

  // Pin the Turbopack root to the monorepo root (the parent of this workspace).
  // Otherwise Next.js walks up the tree collecting every workspace/lockfile and
  // picks the outermost one as the root. In a git worktree nested under the main
  // checkout, that outermost match is the main checkout, which is the wrong root.
  turbopack: {
    root: join(import.meta.dirname, ".."),
  },

  // Allow cross-origin iframe embedding from the Astro app
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
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

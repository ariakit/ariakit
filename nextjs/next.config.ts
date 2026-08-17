import { join } from "node:path";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

const isOpenNextBuild = process.env.OPEN_NEXT_BUILD === "1";

const config: NextConfig = {
  reactCompiler: true,
  typedRoutes: true,

  // Keep Cache Components enabled in the regular build to cover #5147.
  // Next 16.3's runtime hangs when OpenNext runs the output in Workerd.
  cacheComponents: !isOpenNextBuild,

  // Keep `next dev` from adding framework-managed agent instructions here.
  agentRules: false,

  experimental: {
    // Ariakit's route-driven dialogs expect the legacy handler to restore focus.
    // Remove after the fixtures support Next's new focus behavior.
    appNewScrollHandler: false,

    // Next's CLI requires `tsc`, but @typescript/typescript6 exposes `tsc6`.
    // Remove when upstream resolves alias support.
    // https://github.com/vercel/next.js/issues/96589
    useTypeScriptCli: false,
  },

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

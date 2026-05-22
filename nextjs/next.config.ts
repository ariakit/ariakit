import { relative } from "node:path";
import { getAriakitSourceAliases } from "@ariakit/scripts/ariakit-source";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

const ariakitSourceAliases = getAriakitSourceAliases();
const ariakitTurbopackAliases = Object.fromEntries(
  Object.entries(ariakitSourceAliases).map(([specifier, replacement]) => [
    specifier,
    relative(import.meta.dirname, replacement).replaceAll("\\", "/"),
  ]),
);

const config: NextConfig = {
  turbopack: {
    resolveAlias: ariakitTurbopackAliases,
  },

  reactCompiler: true,
  typedRoutes: true,
  typescript: {
    ignoreBuildErrors: true,
  },
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
            // Allow embedding from any ariakit.com/ariakit.org subdomain and workers.dev
            value:
              "frame-ancestors 'self' https://*.ariakit.com https://*.ariakit.org https://*.workers.dev http://localhost:*",
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

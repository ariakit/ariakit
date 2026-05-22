import { relative } from "node:path";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";
import { getAriakitSourceAliases } from "../scripts/ariakit-source.ts";

const ariakitSourceAliases = getAriakitSourceAliases();
const ariakitTurbopackAliases = Object.fromEntries(
  Object.entries(ariakitSourceAliases).map(([specifier, replacement]) => [
    specifier,
    relative(import.meta.dirname, replacement).replaceAll("\\", "/"),
  ]),
);

const config: NextConfig = {
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      ...ariakitSourceAliases,
    };
    config.resolve.conditionNames = [
      "ariakit-source",
      ...(config.resolve.conditionNames ?? ["..."]),
    ];
    return config;
  },

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

/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { join } from "node:path";
import cloudflare from "@astrojs/cloudflare";
import { rehypeHeadingIds, unified } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import solid from "@astrojs/solid-js";
import clerk from "@clerk/astro";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { dummyClerkIntegration } from "./src/lib/dummy-clerk-integration.ts";
import { previewConfig } from "./src/lib/preview-config.ts";
import { previewIntegration } from "./src/lib/preview-integration.ts";
import {
  rehypeAdmonitions,
  rehypeAsTagName,
  rehypePreviousCode,
} from "./src/lib/rehype.ts";
import { sourcePlugin } from "./src/lib/source-plugin.ts";
import { getPlusAccountPath, getPlusCheckoutPath } from "./src/lib/url.ts";

const port = Number(process.env.APP_PORT) || 4321;
const inspectorPort = Number(process.env.APP_INSPECTOR_PORT) || 0;
const hasClerk = process.env.PUBLIC_CLERK_PUBLISHABLE_KEY;
const viteCacheDir = process.env.APP_VITE_CACHE_DIR;

// https://astro.build/config
export default defineConfig({
  site:
    process.env.NODE_ENV === "production"
      ? "https://next.ariakit.com"
      : `http://localhost:${port}`,

  srcDir: "src",

  server: {
    port,
    host: true,
    allowedHosts: true,
  },

  devToolbar: {
    enabled: false,
  },

  adapter: cloudflare({
    imageService: "compile",
    inspectorPort,
  }),

  build: {
    // Prerendering thousands of reference partial pages is the bulk of the
    // build. Rendering a few pages concurrently overlaps their async work
    // (collection reads, markdown rendering, file writes) without exhausting
    // memory on CI runners.
    concurrency: 4,
  },

  vite: {
    // TODO: Remove this workaround once Astro isolates optimizer cache writes.
    // Isolate check/dev optimizer writes so a concurrent check cannot
    // invalidate the dev server's SSR modules.
    // https://github.com/ariakit/ariakit/pull/6418
    cacheDir: viteCacheDir,
    build: {
      // Perf CI enables this so CDP script profiles can resolve source maps.
      sourcemap: process.env.PERF_SOURCE_MAP === "true",
    },
    plugins: [
      tailwindcss(),
      sourcePlugin(join(import.meta.dirname, "src/examples/")),
    ],
    // TODO: Remove this workaround once withastro/astro#17166 is fixed.
    // Pre-optimize bare SSR imports so the Cloudflare adapter cannot reload
    // React mid-request.
    // https://github.com/withastro/astro/issues/17166
    optimizeDeps: {
      include: [
        "astro/virtual-modules/transitions.js",
        "astro/actions/runtime/entrypoints/server.js",
        "astro/zod",
        "astro-remote",
      ],
    },
  },

  markdown: {
    syntaxHighlight: false,
    processor: unified({
      rehypePlugins: [
        rehypeHeadingIds,
        rehypePreviousCode,
        rehypeAdmonitions,
        [rehypeAutolinkHeadings, { behavior: "wrap" }],
        [
          rehypeAsTagName,
          { tags: ["h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol"] },
        ],
      ],
    }),
  },

  integrations: [
    previewIntegration(previewConfig),
    react({ include: ["**/*.react.*", "../packages/*react*/**"] }),
    solid({ include: ["**/*.solid.*", "../packages/*solid*/**"] }),
    mdx({ extendMarkdownConfig: true }),
    !hasClerk
      ? dummyClerkIntegration()
      : clerk({
          signInUrl: getPlusAccountPath({ path: "login" }),
          signUpUrl: getPlusCheckoutPath({ step: "login" }),
          appearance: {
            variables: {
              fontSize: "1rem",
            },
            options: {
              logoPlacement: "none",
              showOptionalFields: false,
            },
          },
        }),
  ],
});

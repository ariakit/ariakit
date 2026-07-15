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
    // TODO: Remove this workaround once Astro isolates optimizer cache writes
    // across dev and check commands. Running `astro check` while `astro dev`
    // is active shares Vite's optimized deps cache, so the checker uses a
    // separate cache directory to avoid invalidating the dev server's optimized
    // SSR modules.
    cacheDir: viteCacheDir,
    build: {
      // Perf CI enables this so CDP script profiles can resolve source maps.
      sourcemap: process.env.PERF_SOURCE_MAP === "true",
    },
    plugins: [
      tailwindcss(),
      sourcePlugin(join(import.meta.dirname, "src/examples/")),
    ],
    // TODO: Remove this workaround once
    // https://github.com/withastro/astro/issues/17166 is fixed. These bare
    // specifiers are missed by the SSR dependency optimizer's initial scan.
    // Some are re-exported from Astro virtual modules (astro:transitions,
    // astro:actions); others are imported directly (astro/zod in
    // content.config.ts, astro-remote in markdown.astro). With the Cloudflare
    // adapter they get optimized lazily during the first cold dev request, and
    // the mid-request optimizer reload resets React's hook dispatcher,
    // producing "Invalid hook call" errors. Pre-including them forces the
    // optimizer to bundle them at startup so no reload happens mid-request. The
    // Cloudflare adapter merges this list into the SSR environment's
    // optimizeDeps.include.
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
          // @clerk/astro 3.4.2 migrated its build to tsdown and inlined a
          // newer `@clerk/ui` `Appearance<Ui<any>>` type into its bundled
          // declarations. That type keeps only per-component overrides (plus
          // the `Ui` brand and `cssLayerName`) and drops the top-level theme
          // props (`variables`, `layout`), so this config no longer
          // type-checks — even though the 3.4.2 changelog reports no runtime
          // or public API change and the legacy appearance options still work
          // at runtime. Because excess-property checks stop at the first
          // unknown key, the `@ts-expect-error` below disables property/value
          // checking for the whole `appearance` object, not just `variables`;
          // edits here go unchecked until Clerk ships a fixed type and the
          // directive can be removed.
          appearance: {
            // @ts-expect-error -- see the note above (upstream type regression).
            variables: {
              fontSize: "1rem",
            },
            layout: {
              logoPlacement: "none",
              showOptionalFields: false,
            },
          },
        }),
  ],
});

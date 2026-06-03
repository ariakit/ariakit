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
import { loadEnvFile } from "node:process";
import cloudflare from "@astrojs/cloudflare";
import { satteri } from "@astrojs/markdown-satteri";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import solid from "@astrojs/solid-js";
import clerk from "@clerk/astro";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { dummyClerkIntegration } from "./src/lib/dummy-clerk-integration.ts";
import {
  satteriAdmonitionsPlugin,
  satteriAsTagNamePlugin,
  satteriAutolinkHeadingsPlugin,
  satteriCodeBlockHastPlugin,
  satteriCodeBlockMdastPlugin,
  satteriHeadingIdsPlugin,
} from "./src/lib/markdown-plugins.ts";
import { previewConfig } from "./src/lib/preview-config.ts";
import { previewIntegration } from "./src/lib/preview-integration.ts";
import { sourcePlugin } from "./src/lib/source-plugin.ts";
import { getPlusAccountPath, getPlusCheckoutPath } from "./src/lib/url.ts";

try {
  loadEnvFile(join(import.meta.dirname, "../.dev.vars"));
} catch (_error) {}

const port = Number(process.env.APP_PORT) || 4321;
const hasClerk = process.env.PUBLIC_CLERK_PUBLISHABLE_KEY;

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
  }),

  vite: {
    plugins: [
      tailwindcss(),
      sourcePlugin(join(import.meta.dirname, "src/examples/")),
    ],
    // TODO: Remove this workaround once
    // https://github.com/withastro/astro/issues/16853 is fixed. These bare
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
    processor: satteri({
      mdastPlugins: [satteriCodeBlockMdastPlugin()],
      hastPlugins: [
        satteriCodeBlockHastPlugin(),
        satteriHeadingIdsPlugin(),
        satteriAutolinkHeadingsPlugin(),
        satteriAdmonitionsPlugin(),
        satteriAsTagNamePlugin({
          tags: ["h1", "h2", "h3", "h4", "h5", "h6", "ul", "ol"],
        }),
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
            layout: {
              logoPlacement: "none",
              showOptionalFields: false,
            },
          },
        }),
  ],
});

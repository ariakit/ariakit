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
import { rehypeHeadingIds } from "@astrojs/markdown-remark";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import solid from "@astrojs/solid-js";
import clerk from "@clerk/astro";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { dummyClerkIntegration } from "./src/lib/dummy-clerk-integration.ts";
import {
  rehypeAdmonitions,
  rehypeAsTagName,
  rehypePreviousCode,
} from "./src/lib/rehype.ts";
import { sourcePlugin } from "./src/lib/source-plugin.ts";
import { getPlusAccountPath, getPlusCheckoutPath } from "./src/lib/url.ts";

try {
  loadEnvFile(join(import.meta.dirname, "../.dev.vars"));
} catch (_error) {}

const hasClerk = process.env.PUBLIC_CLERK_PUBLISHABLE_KEY;

// https://astro.build/config
export default defineConfig({
  site:
    process.env.NODE_ENV === "production"
      ? "https://next.ariakit.org"
      : "http://localhost:4321",

  srcDir: "src",

  server: {
    host: true,
    allowedHosts: true,
  },

  devToolbar: {
    enabled: false,
  },

  adapter: cloudflare({
    imageService: "compile",
    platformProxy: { enabled: true },
  }),

  vite: {
    plugins: [
      tailwindcss(),
      sourcePlugin(join(import.meta.dirname, "src/examples/")),
    ],
  },

  markdown: {
    syntaxHighlight: false,
  },

  integrations: [
    react({ include: ["**/*.react.*", "../packages/*react*/**"] }),
    solid({ include: ["**/*.solid.*", "../packages/*solid*/**"] }),
    mdx({
      extendMarkdownConfig: true,
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

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
import { sourcePlugin } from "./src/lib/source-plugin.ts";
import { getPlusAccountPath, getPlusCheckoutPath } from "./src/lib/url.ts";

try {
  loadEnvFile(join(import.meta.dirname, "../.dev.vars"));
} catch (error) {}

const hasClerk = process.env.PUBLIC_CLERK_PUBLISHABLE_KEY;

// https://astro.build/config
export default defineConfig({
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
      rehypePlugins: [
        rehypeHeadingIds,
        [rehypeAutolinkHeadings, { behavior: "wrap" }],
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

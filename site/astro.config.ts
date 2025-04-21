import { join } from "node:path";
import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import solid from "@astrojs/solid-js";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { sourcePlugin } from "./src/lib/source-plugin.ts";

// https://astro.build/config
export default defineConfig({
  srcDir: "src",
  devToolbar: {
    enabled: false,
  },
  adapter: cloudflare({
    imageService: "cloudflare",
  }),

  vite: {
    plugins: [
      // @ts-expect-error
      tailwindcss(),
      // @ts-expect-error
      sourcePlugin(join(import.meta.dirname, "src/examples/")),
    ],
  },

  integrations: [
    mdx(),
    react({ include: ["**/*.react.*", "../packages/*react*/**"] }),
    solid({ include: ["**/*.solid.*", "../packages/*solid*/**"] }),
  ],
});

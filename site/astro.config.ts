import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import solid from "@astrojs/solid-js";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { depsRawPlugin } from "./plugins/deps-raw-plugin";

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
    // @ts-expect-error
    plugins: [tailwindcss(), depsRawPlugin()],
  },

  integrations: [
    mdx(),
    react({ include: ["**/*.react.*", "../packages/*react*/**"] }),
    solid({ include: ["**/*.solid.*", "../packages/*solid*/**"] }),
  ],
});

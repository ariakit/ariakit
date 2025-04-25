import { join } from "node:path";
import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import solid from "@astrojs/solid-js";
import clerk from "@clerk/astro";
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
    imageService: "compile",
  }),

  env: {
    schema: {},
  },

  vite: {
    plugins: [
      tailwindcss(),
      sourcePlugin(join(import.meta.dirname, "src/examples/")),
    ],
  },

  integrations: [
    clerk({
      signInUrl: "/sign-in",
      signUpUrl: "/sign-up",
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
    mdx(),
    react({ include: ["**/*.react.*", "../packages/*react*/**"] }),
    solid({ include: ["**/*.solid.*", "../packages/*solid*/**"] }),
  ],
});

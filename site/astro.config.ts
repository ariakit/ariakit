import { join } from "node:path";
import { loadEnvFile } from "node:process";
import cloudflare from "@astrojs/cloudflare";
import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import solid from "@astrojs/solid-js";
import clerk from "@clerk/astro";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig, envField } from "astro/config";
import { sourcePlugin } from "./src/lib/source-plugin.ts";

try {
  loadEnvFile(join(import.meta.dirname, "../.dev.vars"));
} catch (error) {}

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

  redirects: {
    "/plus/checkout": "/plus/checkout/sign-up/personal",
    "/plus/checkout/[step]": "/plus/checkout/[step]/personal",
  },

  adapter: cloudflare({
    imageService: "compile",
    platformProxy: { enabled: true },
  }),

  env: {
    schema: {
      PUBLIC_CLERK_PUBLISHABLE_KEY: envField.string({
        context: "client",
        access: "public",
        optional: true,
      }),
    },
  },

  vite: {
    plugins: [
      tailwindcss(),
      sourcePlugin(join(import.meta.dirname, "src/examples/")),
    ],
  },

  integrations: [
    mdx(),
    react({ include: ["**/*.react.*", "../packages/*react*/**"] }),
    solid({ include: ["**/*.solid.*", "../packages/*solid*/**"] }),
    clerk({
      signInUrl: "/plus/account/sign-in",
      signUpUrl: "/plus/account/sign-up",
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

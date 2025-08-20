import reactPlugin from "@vitejs/plugin-react";
import { version } from "react";
import solidPlugin from "vite-plugin-solid";
import { configDefaults, defineConfig, type Plugin } from "vitest/config";

const excludeFromReact17 = [
  "examples/form-callback-queue",
  "examples/*-framer-motion/**",
  "examples/dialog-animated-various",
  "examples/combobox-group",
  "site/src/examples/combobox-group",
  "examples/*-radix*/**",
  "examples/*react-router*/**",
];

const includeWithStyles = [
  /combobox-tabs-animated/,
  /dialog-animated-various/,
  /dialog-combobox-command-menu/,
  /disclosure-content-animating/,
];

const isReact17 = version.startsWith("17");

const ALLOWED_TEST_LOADERS = ["react", "solid"] as const;
export type AllowedTestLoader = (typeof ALLOWED_TEST_LOADERS)[number];
const LOADER = (process.env.ARIAKIT_TEST_LOADER ??
  "react") as AllowedTestLoader;
if (!ALLOWED_TEST_LOADERS.includes(LOADER))
  throw new Error(`Invalid loader: ${LOADER}`);

const PLUGINS_BY_LOADER: Record<string, Array<Plugin> | undefined> = {
  // @ts-expect-error I believe this error will go away when we regenerate
  // package-lock.json
  react: [reactPlugin()],
  solid: [solidPlugin()],
};

export default defineConfig({
  plugins: PLUGINS_BY_LOADER[LOADER],
  resolve: {
    alias: {
      "@ariakit/test": new URL("./packages/ariakit-test/esm", import.meta.url)
        .pathname,
      "@ariakit/core": new URL("./packages/ariakit-core/esm", import.meta.url)
        .pathname,
      "@ariakit/react": new URL("./packages/ariakit-react/esm", import.meta.url)
        .pathname,
      "@ariakit/react-core": new URL(
        "./packages/ariakit-react-core/esm",
        import.meta.url,
      ).pathname,
      "@ariakit/solid": new URL("./packages/ariakit-solid/esm", import.meta.url)
        .pathname,
      "@ariakit/solid-core": new URL(
        "./packages/ariakit-solid-core/esm",
        import.meta.url,
      ).pathname,
    },
  },
  test: {
    globals: true,
    watch: false,
    testTimeout: 10_000,
    environment: "jsdom",
    setupFiles: ["vitest.setup.ts"],
    include: ["**/*test.{ts,tsx}", `**/*test.${LOADER}.{ts,tsx}`],
    exclude: [
      ...configDefaults.exclude,
      ...(isReact17 ? excludeFromReact17 : []),
    ],
    browser: {
      name: "chromium",
    },
    css: {
      include: includeWithStyles,
    },
    sequence: {
      hooks: "parallel",
    },
    coverage: {
      include: ["packages"],
    },
  },
});

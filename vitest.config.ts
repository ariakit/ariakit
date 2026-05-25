import { existsSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import reactPlugin from "@vitejs/plugin-react";
import type { PluginOption } from "vite";
import solidPlugin from "vite-plugin-solid";
import { configDefaults, defineConfig } from "vitest/config";
import { sourcePlugin } from "./app/src/lib/source-plugin.ts";

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

// In a pnpm monorepo, each workspace package may resolve its own copy of
// react from its node_modules. We pin all imports to a single copy via
// resolve.alias to prevent "multiple React instances" errors in tests.
const require = createRequire(import.meta.url);
const examplesPackageJson = require("./examples/package.json") as PackageJson;
const react19PackageJson =
  require("./test/react-19/package.json") as PackageJson;
const requireReact18 = createRequire(
  new URL("./examples/package.json", import.meta.url),
);
const requireReact19 = createRequire(
  new URL("./test/react-19/package.json", import.meta.url),
);

function resolvePkg(pkg: string, resolver = require) {
  try {
    return dirname(resolver.resolve(`${pkg}/package.json`));
  } catch {
    let dir = dirname(resolver.resolve(pkg));
    while (!existsSync(join(dir, "package.json"))) {
      const parent = dirname(dir);
      if (parent === dir) throw new Error(`Could not resolve package: ${pkg}`);
      dir = parent;
    }
    return dir;
  }
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function aliasPkg(pkg: string, resolver = require) {
  const escapedPkg = escapeRegExp(pkg);
  return {
    find: new RegExp(`^${escapedPkg}($|/)`),
    replacement: `${resolvePkg(pkg, resolver)}$1`,
  };
}

const includeWithStyles = [
  /combobox-tabs-animated/,
  /dialog-animated-various/,
  /dialog-combobox-command-menu/,
  /disclosure-content-animating/,
];

function getDependencyNames(packageJson: PackageJson) {
  return [
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.devDependencies ?? {}),
  ];
}

const ALLOWED_TEST_LOADERS = ["react", "solid"] as const;
export type AllowedTestLoader = (typeof ALLOWED_TEST_LOADERS)[number];
const LOADER = (process.env.ARIAKIT_TEST_LOADER ??
  "react") as AllowedTestLoader;
if (!ALLOWED_TEST_LOADERS.includes(LOADER))
  throw new Error(`Invalid loader: ${LOADER}`);

const ALLOWED_REACT_VERSIONS = ["18", "19"] as const;
type AllowedReactVersion = (typeof ALLOWED_REACT_VERSIONS)[number];
const REACT_VERSION = (process.env.ARIAKIT_TEST_REACT ??
  "19") as AllowedReactVersion;
if (!ALLOWED_REACT_VERSIONS.includes(REACT_VERSION)) {
  throw new Error(`Invalid React version: ${REACT_VERSION}`);
}

const reactResolver = REACT_VERSION === "18" ? requireReact18 : requireReact19;

// test/react-19 lists the React-peered example dependencies that need a
// separate React 19 peer graph. Keep those dependencies mirrored here.
const typeOnlyPackages = new Set(["@types/react", "@types/react-dom"]);
const examplesDependencies = new Set(getDependencyNames(examplesPackageJson));
const reactPeerPackages = getDependencyNames(react19PackageJson).filter(
  (pkg) => {
    if (typeOnlyPackages.has(pkg)) return false;
    if (!examplesDependencies.has(pkg)) {
      throw new Error(`${pkg} must be declared in examples/package.json`);
    }
    return true;
  },
);

// sourcePlugin is typed against the app workspace's Vite copy, while Vitest
// consumes the root Vite types. The runtime plugin shape is compatible.
// TODO: Remove this cast when Astro and the root test stack use the same Vite
// major again; this may happen with Astro 7 and Vite 8.
const sourcePluginInstance = sourcePlugin(
  join(import.meta.dirname, "app/src/examples/"),
) as unknown as PluginOption;

const PLUGINS_BY_LOADER: Record<string, Array<PluginOption> | undefined> = {
  react: [reactPlugin(), sourcePluginInstance],
  solid: [solidPlugin(), sourcePluginInstance],
};

export default defineConfig({
  plugins: PLUGINS_BY_LOADER[LOADER],
  resolve: {
    alias: reactPeerPackages.map((pkg) => aliasPkg(pkg, reactResolver)),
    dedupe: ["react", "react-dom"],
  },
  test: {
    watch: false,
    testTimeout: 10_000,
    environment: "jsdom",
    setupFiles: ["vitest.setup.ts"],
    exclude: [...configDefaults.exclude, ".claude/**"],
    include: ["**/*test.{ts,tsx}", `**/*test.${LOADER}.{ts,tsx}`],
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

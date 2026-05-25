import { existsSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";
import { getReactViteAliases, reactDedupe } from "@ariakit/scripts/react";
import reactPlugin from "@vitejs/plugin-react";
import type { PluginOption } from "vite";
import solidPlugin from "vite-plugin-solid";
import { configDefaults, defineConfig } from "vitest/config";
import { sourcePlugin } from "./app/src/lib/source-plugin.ts";
import examplesPackageJson from "./examples/package.json" with { type: "json" };
import rootPackageJson from "./package.json" with { type: "json" };

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

const rootDir = process.cwd();
const requireExamples = createRequire(join(rootDir, "examples/package.json"));

const includeWithStyles = [
  /combobox-tabs-animated/,
  /dialog-animated-various/,
  /dialog-combobox-command-menu/,
  /disclosure-content-animating/,
];

const ignoredReactPeerPackages = new Set([
  "@playwright/test",
  "@wordpress/components",
  "vitest",
]);

function getDependencyNames(packageJson: PackageJson) {
  return [
    ...Object.keys(packageJson.dependencies ?? {}),
    ...Object.keys(packageJson.devDependencies ?? {}),
  ];
}

function shouldAliasPackage(pkg: string) {
  if (pkg.startsWith("@ariakit/")) return false;
  if (pkg.startsWith("@types/")) return false;
  return !ignoredReactPeerPackages.has(pkg);
}

function resolvePkg(pkg: string) {
  try {
    return dirname(requireExamples.resolve(`${pkg}/package.json`));
  } catch {
    let dir = dirname(requireExamples.resolve(pkg));
    while (!existsSync(join(dir, "package.json"))) {
      const parent = dirname(dir);
      if (parent === dir) throw new Error(`Could not resolve package: ${pkg}`);
      dir = parent;
    }
    return dir;
  }
}

function readPackageJson(pkg: string): PackageJson {
  return JSON.parse(
    readFileSync(join(resolvePkg(pkg), "package.json"), "utf-8"),
  );
}

function hasReactPeerDependency(pkg: string) {
  const peerDependencies = readPackageJson(pkg).peerDependencies ?? {};
  return "react" in peerDependencies || "react-dom" in peerDependencies;
}

const rootDependencies = new Set(getDependencyNames(rootPackageJson));
const examplesDependencies = getDependencyNames(examplesPackageJson);
const reactPeerPackages = examplesDependencies.filter((pkg) => {
  if (!shouldAliasPackage(pkg)) return false;

  const isRootDependency = rootDependencies.has(pkg);
  if (!isRootDependency && hasReactPeerDependency(pkg)) {
    throw new Error(`${pkg} must be declared in root package.json`);
  }

  return isRootDependency;
});

const ALLOWED_TEST_LOADERS = ["react", "solid"] as const;
export type AllowedTestLoader = (typeof ALLOWED_TEST_LOADERS)[number];
const LOADER = (process.env.ARIAKIT_TEST_LOADER ??
  "react") as AllowedTestLoader;
if (!ALLOWED_TEST_LOADERS.includes(LOADER))
  throw new Error(`Invalid loader: ${LOADER}`);

// sourcePlugin is typed against the app workspace's Vite copy, while Vitest
// consumes the root Vite types. The runtime plugin shape is compatible.
// TODO: Remove this cast when Astro and the root test stack use the same Vite
// major again; this may happen with Astro 7 and Vite 8.
const sourcePluginInstance = sourcePlugin(
  join(rootDir, "app/src/examples/"),
) as unknown as PluginOption;

const PLUGINS_BY_LOADER: Record<string, Array<PluginOption> | undefined> = {
  react: [reactPlugin(), sourcePluginInstance],
  solid: [solidPlugin(), sourcePluginInstance],
};

export default defineConfig({
  root: rootDir,
  plugins: PLUGINS_BY_LOADER[LOADER],
  resolve: {
    alias: getReactViteAliases({
      rootPath: rootDir,
      packages: reactPeerPackages,
    }),
    dedupe: reactDedupe,
  },
  test: {
    watch: false,
    testTimeout: 10_000,
    environment: "jsdom",
    setupFiles: [join(rootDir, "vitest.setup.ts")],
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

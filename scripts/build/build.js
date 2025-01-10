import { solidPlugin } from "esbuild-plugin-solid";
import { build } from "tsup";
import { cwd, isCore, isReact, isSolid } from "./context.js";
import {
  cleanBuild,
  getCJSDir,
  getESMDir,
  getPublicFiles,
  getSolidSourceDir,
  getSourcePath,
  makeDeclarationFiles,
  makeGitignore,
  makeProxies,
  writePackageJson,
} from "./utils.js";

Object.defineProperty(process.env, "NODE_ENV", {
  writable: true,
  enumerable: true,
  configurable: true,
  value: "production",
});

cleanBuild(cwd);

writePackageJson(cwd, true);
makeGitignore(cwd);
makeProxies(cwd);
makeDeclarationFiles(cwd);
console.log("");

const sourcePath = getSourcePath(cwd);
const entry = getPublicFiles(sourcePath);
const esmDir = getESMDir();
const cjsDir = getCJSDir();
const solidSourceDir = getSolidSourceDir();

const builds = /** @type {const} */ ([
  { format: "esm", outDir: esmDir },
  { format: "cjs", outDir: cjsDir },
]);

/** @param {{ format: import("tsup").Format, outDir: string }} options */
function buildCoreAndReact({ format, outDir }) {
  if (!isCore && !isReact) return;
  return build({
    entry,
    format,
    outDir,
    // dts: true,
    // tsconfig: "tsconfig.build.json",
    splitting: true,
    esbuildOptions(options) {
      options.chunkNames = "__chunks/[hash]";
      if (format === "esm") {
        options.banner = {
          js: '"use client";',
        };
      }
    },
  });
}

/** @param {{ format: import("tsup").Format, outDir: string }} options */
function buildSolid({ format, outDir }) {
  if (!isSolid) return;
  return build({
    entry,
    format,
    outDir,
    // dts: true,
    // tsconfig: "tsconfig.build.json",
    splitting: true,
    esbuildOptions(options) {
      options.chunkNames = "__chunks/[hash]";
      options.jsx = "preserve";
    },
    esbuildPlugins: [solidPlugin({ solid: { generate: "dom" } })],
  });
}

function buildSolidSource() {
  if (!isSolid) return;
  return build({
    entry,
    format: "esm",
    outDir: solidSourceDir,
    splitting: true,
    outExtension() {
      return { js: ".jsx" };
    },
    esbuildOptions(options) {
      options.chunkNames = "__chunks/[hash]";
      options.jsx = "preserve";
    },
  });
}

await Promise.all([
  ...builds.map(buildCoreAndReact),
  ...builds.map(buildSolid),
  buildSolidSource(),
]);

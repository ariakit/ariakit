import { cpSync, existsSync } from "node:fs";
import { join } from "node:path";
import spawn from "cross-spawn";
import { glob } from "glob";
import { build } from "tsup";
import { cwd, isFramework, isReact } from "./context.js";
import {
  cleanBuild,
  getCJSDir,
  getESMDir,
  getPublicFiles,
  getSourcePath,
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

const sourcePath = getSourcePath(cwd);
const entry = getPublicFiles(sourcePath);
const esmDir = getESMDir();
const cjsDir = getCJSDir();

// Get the tsconfig path for the current package. If tsconfig.build.json exists, use it, otherwise use tsconfig.json.
const tsconfigPath = existsSync(join(cwd, "tsconfig.build.json"))
  ? "tsconfig.build.json"
  : "tsconfig.json";

spawn.sync(
  "tsc",
  [
    "--emitDeclarationOnly",
    "--project",
    tsconfigPath,
    "--noEmit",
    "false",
    "--outDir",
    esmDir,
  ],
  { stdio: "inherit" },
);

cpSync(esmDir, cjsDir, { recursive: true });

const declarationFiles = glob.sync("**/*.d.ts", {
  cwd: cjsDir,
  absolute: true,
});

for (const file of declarationFiles) {
  const ctsFile = file.replace(/\.d\.ts$/, ".d.cts");
  cpSync(file, ctsFile);
}

const builds = /** @type {const} */ ([
  { format: "esm", outDir: esmDir },
  { format: "cjs", outDir: cjsDir },
]);

const cjsInternalPackages = [
  /^@ariakit\/components($|\/)/,
  /^@ariakit\/react-components($|\/)/,
  /^@ariakit\/react-store($|\/)/,
  /^@ariakit\/react-utils($|\/)/,
  /^@ariakit\/store($|\/)/,
  /^@ariakit\/utils($|\/)/,
];

/** @param {{ format: import("tsup").Format, outDir: string }} options */
function buildStandard({ format, outDir }) {
  if (isFramework) return;
  return build({
    entry,
    format,
    outDir,
    noExternal: format === "cjs" ? cjsInternalPackages : undefined,
    // dts: true,
    // tsconfig: "tsconfig.build.json",
    splitting: true,
    esbuildOptions(options) {
      options.chunkNames = "__chunks/[hash]";
      // TODO: this might not be necessary for anything other than react and react-components
      if (format === "esm") {
        options.banner = {
          js: '"use client";',
        };
      }
    },
  });
}

/** @param {{ format: import("tsup").Format, outDir: string }} options */
function buildReact({ format, outDir }) {
  if (!isReact) return;
  return build({
    entry,
    format,
    outDir,
    noExternal: format === "cjs" ? cjsInternalPackages : undefined,
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

await Promise.all([...builds.map(buildStandard), ...builds.map(buildReact)]);

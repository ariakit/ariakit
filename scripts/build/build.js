import { cpSync } from "node:fs";
import spawn from "cross-spawn";
import { solidPlugin } from "esbuild-plugin-solid";
import { glob } from "glob";
import { build } from "tsup";
import { cwd, isCore, isReact, isSolid } from "./context.js";
import {
  cleanBuild,
  getCJSDir,
  getESMDir,
  getPublicFiles,
  getSolidSourceDir,
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
const solidSourceDir = getSolidSourceDir();

spawn.sync(
  "tsc",
  [
    "--emitDeclarationOnly",
    "--project",
    "tsconfig.build.json",
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

/** @type {Array<{ format: import("tsup").Format, outDir: string, options?: Record<string, any> }>} */
const builds = [
  { format: "esm", outDir: esmDir },
  { format: "cjs", outDir: cjsDir },
  {
    format: "esm",
    outDir: solidSourceDir,
    options: {
      skip: !isSolid,
      outJsExtension: ".jsx",
      solidSource: true,
    },
  },
];

await Promise.all(
  builds.map(
    ({
      format,
      outDir,
      options: {
        skip = false,
        outJsExtension = ".js",
        solidSource = false,
      } = {},
    }) =>
      !skip &&
      build({
        entry,
        format,
        outDir,
        // dts: true,
        // tsconfig: "tsconfig.build.json",
        splitting: true,
        esbuildOptions(options) {
          options.chunkNames = "__chunks/[hash]";
          if (isCore || isReact) {
            options.banner = {
              js: '"use client";',
            };
          }
          if (isSolid) {
            options.jsx = "preserve";
          }
        },
        outExtension() {
          return { js: outJsExtension };
        },
        esbuildPlugins: [
          ...(isSolid && !solidSource
            ? [solidPlugin({ solid: { generate: "dom" } })]
            : []),
        ],
      }),
  ),
);

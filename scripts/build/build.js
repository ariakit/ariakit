import { build } from "tsup";
import {
  cleanBuild,
  getCJSDir,
  getESMDir,
  getPublicFiles,
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

const cwd = process.cwd();

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

const builds = /** @type {const} */ ([
  { format: "esm", outDir: esmDir },
  { format: "cjs", outDir: cjsDir },
]);

await Promise.all(
  builds.map(({ format, outDir }) =>
    build({
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
    }),
  ),
);

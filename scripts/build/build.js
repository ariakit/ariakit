import { build } from "tsup";
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

const cwd = process.cwd();

cleanBuild(cwd);

writePackageJson(cwd, true);
makeGitignore(cwd);
makeProxies(cwd);

const sourcePath = getSourcePath(cwd);
const entry = getPublicFiles(sourcePath);
const esmDir = getESMDir();
const cjsDir = getCJSDir();

const builds = /** @type {const} */ ([
  { format: "esm", outDir: esmDir },
  { format: "cjs", outDir: cjsDir },
]);

for (const { format, outDir } of builds) {
  await build({
    entry,
    format,
    outDir,
    splitting: true,
    dts: {
      compilerOptions: {
        incremental: false,
      },
    },
    esbuildOptions(options) {
      options.chunkNames = "__chunks/[hash]";
    },
  });
}

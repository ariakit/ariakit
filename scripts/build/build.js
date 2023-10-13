import spawn from "cross-spawn";
import fse from "fs-extra";
import { glob } from "glob";
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

fse.copySync(esmDir, cjsDir);

const declarationFiles = glob.sync("**/*.d.ts", {
  cwd: cjsDir,
  absolute: true,
});

for (const file of declarationFiles) {
  const ctsFile = file.replace(/\.d\.ts$/, ".d.cts");
  fse.copySync(file, ctsFile);
}

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
      splitting: true,
      esbuildOptions(options) {
        options.chunkNames = "__chunks/[hash]";
      },
    }),
  ),
);

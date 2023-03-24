// @ts-check
import spawn from "cross-spawn";
import fse from "fs-extra";
import { build } from "tsup";
import {
  cleanBuild,
  getCJSDir,
  getESMDir,
  getPublicFiles,
  getSourcePath,
  makeGitignore,
  makeProxies,
  writeBuildPackage,
} from "./utils.mjs";

Object.defineProperty(process.env, "NODE_ENV", { value: "production" });

const cwd = process.cwd();

cleanBuild(cwd);

writeBuildPackage(cwd);
makeGitignore(cwd);
makeProxies(cwd);

const sourcePath = getSourcePath(cwd);
const entry = getPublicFiles(sourcePath);
const esmDir = getESMDir();
const cjsDir = getCJSDir();

spawn.sync("tsc", ["--emitDeclarationOnly", "--outDir", esmDir], {
  stdio: "inherit",
});

fse.copySync(esmDir, cjsDir);

const builds = [
  { format: "esm", outDir: esmDir },
  { format: "cjs", outDir: cjsDir },
];

for (const { format, outDir } of builds) {
  await build({
    entry,
    format,
    outDir,
    splitting: true,
    esbuildOptions(options) {
      options.chunkNames = "__chunks/[hash]";
    },
  });
}

import spawn from "cross-spawn";
import fse from "fs-extra";
import { build } from "tsup";
import {
  cleanBuild,
  getMainDir,
  getModuleDir,
  getPublicFiles,
  getSourcePath,
  makeGitignore,
  makeProxies,
  writeBuildPackage,
} from "./utils.mjs";

process.env.NODE_ENV = "production";

if (process.argv.includes("--no-umd")) {
  process.env.NO_UMD = true;
}

const cwd = process.cwd();

cleanBuild(cwd);

writeBuildPackage(cwd);
makeGitignore(cwd);
makeProxies(cwd);

const sourcePath = getSourcePath(cwd);
const entry = getPublicFiles(sourcePath);

const esmDir = getModuleDir(cwd);
const cjsDir = getMainDir(cwd);

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
    esbuildOptions(options) {
      options.chunkNames = "__chunks/[hash]";
    },
  });
}

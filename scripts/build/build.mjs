// @ts-check
import { renameSync } from "fs";
import { join } from "path";
import spawn from "cross-spawn";
import fse from "fs-extra";
import { globSync } from "glob";
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

const dts = globSync("**/*.d.ts", { cwd: cjsDir });

for (const file of dts) {
  renameSync(join(cjsDir, file), join(cjsDir, file.replace(/\.ts$/, ".cts")));
}

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

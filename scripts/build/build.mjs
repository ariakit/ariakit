import "./clean.mjs";
import spawn from "cross-spawn";
import { build } from "esbuild";
import fse from "fs-extra";
import { globSync } from "glob";
import {
  getMainDir,
  getModuleDir,
  getPublicFiles,
  getSourcePath,
  makeGitignore,
  makeProxies,
} from "./utils.mjs";

process.env.NODE_ENV = "production";

if (process.argv.includes("--no-umd")) {
  process.env.NO_UMD = true;
}

const cwd = process.cwd();
const sourcePath = getSourcePath(cwd);
const publicFiles = getPublicFiles(sourcePath);

makeGitignore(cwd);
makeProxies(cwd);

const esmDir = getModuleDir(cwd);

spawn.sync("tsc", ["--emitDeclarationOnly", "--outDir", esmDir], {
  stdio: "inherit",
});

await build({
  entryPoints: publicFiles,
  outdir: esmDir,
  format: "esm",
  platform: "node",
  target: ["es2015"],
  bundle: true,
  splitting: true,
  packages: "external",
  chunkNames: "__chunks/[hash]",
});

const cjsDir = getMainDir(cwd);

fse.copySync(esmDir, cjsDir);

const builtFiles = globSync(`${cjsDir}/**/*.js`);

await build({
  entryPoints: builtFiles,
  outdir: cjsDir,
  format: "cjs",
  target: ["es2015"],
  allowOverwrite: true,
});

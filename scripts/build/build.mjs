import spawn from "cross-spawn";
import { build } from "esbuild";
import {
  getMainDir,
  getModuleDir,
  getPublicFiles,
  getSourcePath,
  makeGitignore,
  makeProxies,
} from "./utils.mjs";

import "./clean.mjs";

process.env.NODE_ENV = "production";

if (process.argv.includes("--no-umd")) {
  process.env.NO_UMD = true;
}

const cwd = process.cwd();
const sourcePath = getSourcePath(cwd);
const entryPoints = getPublicFiles(sourcePath);

makeGitignore(cwd);
makeProxies(cwd);

const builds = [
  { outdir: getMainDir(cwd), format: "cjs" },
  { outdir: getModuleDir(cwd), format: "esm" },
];

for (const { outdir, format } of builds) {
  spawn.sync("tsc", ["--emitDeclarationOnly", "--outDir", outdir], {
    stdio: "inherit",
  });
  await build({
    entryPoints,
    outdir,
    format,
    platform: "node",
    target: ["es2015"],
    bundle: true,
    splitting: true,
    packages: "external",
    chunkNames: "__chunks/[hash]",
  });
}

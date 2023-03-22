// import { fileURLToPath } from "url";
import spawn from "cross-spawn";
import { build } from "esbuild";
import {
  getModuleDir,
  getPackage,
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
const pkg = getPackage(cwd);
const sourcePath = getSourcePath(cwd);
const entryPoints = getPublicFiles(sourcePath);

makeGitignore(cwd);
makeProxies(cwd);

// spawn.sync("tsc", ["--emitDeclarationOnly", "--outDir", getModuleDir(cwd)], {
//   stdio: "inherit",
// });

await build({
  entryPoints,
  sourceRoot: sourcePath,
  outdir: getModuleDir(cwd),
  platform: "node",
  format: "esm",
});

// const configPath = fileURLToPath(new URL("rollup.config.mjs", import.meta.url));

// spawn.sync("rollup", ["-c", configPath], { stdio: "inherit" });

// @ts-check
import { fileURLToPath } from "url";
import spawn from "cross-spawn";
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

const cjsConfigPath = fileURLToPath(
  new URL("../../tsconfig.cjs.json", import.meta.url)
);

spawn.sync(
  "tsc",
  ["--emitDeclarationOnly", "--project", cjsConfigPath, "--outDir", cjsDir],
  {
    stdio: "inherit",
  }
);

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

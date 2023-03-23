// @ts-check
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

// "target": "ES5",
//     "module": "CommonJS",
//     "moduleResolution": "classic"

// spawn.sync(
//   "tsc",
//   [
//     "--emitDeclarationOnly",
//     "--target",
//     "es5",
//     "--module",
//     "commonjs",
//     "--moduleResolution",
//     "node",
//     "--outDir",
//     cjsDir,
//   ],
//   {
//     stdio: "inherit",
//   }
// );

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

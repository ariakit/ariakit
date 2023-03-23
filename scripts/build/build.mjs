import "./clean.mjs";
import { join } from "path";
import { fileURLToPath } from "url";
import spawn from "cross-spawn";
// import { build } from "esbuild";
import fse from "fs-extra";
import { globSync } from "glob";
import { build } from "tsup";
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

await build({
  entry: publicFiles,
  format: "cjs",
  outDir: getMainDir(cwd),
  splitting: true,
  clean: true,
});

// spawn.sync("tsc", ["--emitDeclarationOnly", "--outDir", esmDir], {
//   stdio: "inherit",
// });

// await build({
//   entryPoints: publicFiles,
//   outdir: esmDir,
//   format: "esm",
//   platform: "node",
//   target: ["chrome58", "edge18", "firefox57", "safari11"],
//   bundle: true,
//   splitting: true,
//   packages: "external",
//   chunkNames: "__chunks/[hash]",
// });

// const cjsDir = getMainDir(cwd);

// fse.copySync(esmDir, cjsDir, {
//   filter: (src) => src.endsWith(".d.ts"),
// });

// const builtFiles = globSync(`${esmDir}/**/*.js`);

// await build({
//   entryPoints: builtFiles,
//   outdir: cjsDir,
//   format: "cjs",
//   platform: "node",
//   outExtension: { ".js": ".cjs" },
//   plugins: [
//     {
//       name: "add-cjs",
//       setup(build) {
//         build.onLoad({ filter: /\.js$/ }, (args) => {
//           return {
//             path: args.path
//               .replace(/^\.\/esm/, "./cjs")
//               .replace(/\.js$/, ".cjs"),
//             namespace: args.resolveDir,
//           };
//         });
//       },
//     },
//   ],
// });

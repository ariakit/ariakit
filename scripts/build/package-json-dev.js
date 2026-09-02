import { isAbsolute, join, relative } from "node:path";
import { watch } from "chokidar";
import { globSync } from "glob";
import { updateSourcePackageJson } from "../../packages/ariakit-scripts/src/build.ts";
import { readPackageJson, writePackageJson } from "./utils.js";

/** @param {string} path */
function normalizePath(path) {
  return path.replace(/\\/g, "/");
}

/** @param {string} path */
function shouldIgnoreWatchPath(path) {
  const relativePath = isAbsolute(path) ? relative(process.cwd(), path) : path;
  const normalizedPath = normalizePath(relativePath);
  const [root, packageName, entry] = normalizedPath.split("/");

  if (root !== "packages") return false;
  if (!packageName) return false;
  if (!entry) return false;

  return entry !== "src";
}

/** @param {string} path */
async function processDevPackage(path) {
  if (path.includes("ariakit-tailwind")) return;
  if (path.includes("ariakit-ui")) return;
  if (path.includes("ariakit-scripts")) return;
  const match = path.match(/packages\/(.*)\/src/);
  if (!match) return;
  const [, pkg] = match;
  if (!pkg) return;
  const pkgPath = join(process.cwd(), "packages", pkg);
  const pkgJson = readPackageJson(pkgPath);
  if (pkgJson.scripts?.build?.startsWith("ariakit build")) {
    await updateSourcePackageJson(pkgPath);
    return;
  }
  writePackageJson(pkgPath);
}

const packages = globSync("packages/*/src");

for (const path of packages) {
  await processDevPackage(path);
}

/** @param {string} path */
function handleChange(path) {
  void processDevPackage(path);
}

watch("packages", {
  ignoreInitial: true,
  ignored: shouldIgnoreWatchPath,
})
  .on("add", handleChange)
  .on("unlink", handleChange)
  .on("unlinkDir", handleChange);

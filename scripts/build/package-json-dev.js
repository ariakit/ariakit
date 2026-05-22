import { join } from "node:path";
import { watch } from "chokidar";
import { globSync } from "glob";
import { writePackageJson } from "./utils.js";

const pureEsmPackages = new Set([
  "ariakit-react-store",
  "ariakit-react-utils",
  "ariakit-solid-store",
  "ariakit-solid-utils",
  "ariakit-store",
  "ariakit-utils",
]);

/** @param {string} path */
function processDevPackage(path) {
  if (path.includes("ariakit-tailwind")) return;
  const match = path.match(/packages\/(.*)\/src/);
  if (!match) return;
  const [, pkg] = match;
  if (!pkg) return;
  if (pureEsmPackages.has(pkg)) return;
  const pkgPath = join(process.cwd(), "packages", pkg);
  writePackageJson(pkgPath);
}

const packages = globSync("packages/*/src");

for (const path of packages) {
  processDevPackage(path);
}

watch(["packages/*/src/**"], { ignoreInitial: true })
  .on("add", processDevPackage)
  .on("unlink", processDevPackage)
  .on("unlinkDir", processDevPackage);

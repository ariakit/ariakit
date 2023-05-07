import { join } from "path";
import { watch } from "chokidar";
import { globSync } from "glob";
import { writePackageJson } from "./utils.js";

/** @param {string} path */
function processDevPackage(path) {
  const match = path.match(/packages\/(.*)\/src/);
  if (!match) return;
  const [, pkg] = match;
  if (!pkg) return;
  const pkgPath = join(process.cwd(), "packages", pkg);
  writePackageJson(pkgPath);
}

const packages = globSync("packages/*/src");

packages.forEach(processDevPackage);

watch("packages/*/src/**", { ignoreInitial: true })
  .on("add", processDevPackage)
  .on("unlink", processDevPackage)
  .on("unlinkDir", processDevPackage);

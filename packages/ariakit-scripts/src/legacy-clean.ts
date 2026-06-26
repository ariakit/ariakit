import { readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { readPackageJson } from "./utils.ts";
import type { PackageJson } from "./utils.ts";

const sourceDir = "src";
const cjsDir = "cjs";
const esmDir = "esm";

function writePackageJson(rootPath: string, packageJson: PackageJson) {
  const packageJsonPath = join(rootPath, "package.json");
  const currentContents = readFileSync(packageJsonPath, "utf-8");
  const nextContents = `${JSON.stringify(packageJson, null, 2)}\n`;
  const currentContentsMin = JSON.stringify(JSON.parse(currentContents));
  const nextContentsMin = JSON.stringify(JSON.parse(nextContents));
  if (currentContentsMin === nextContentsMin) return;
  writeFileSync(packageJsonPath, nextContents);
}

function updateSourcePackageFields(rootPath: string) {
  const packageJson = readPackageJson(rootPath);
  const sourceIndex = `${sourceDir}/index.ts`;
  if ("main" in packageJson) packageJson.main = sourceIndex;
  if ("module" in packageJson) packageJson.module = sourceIndex;
  if ("types" in packageJson) packageJson.types = sourceIndex;
  writePackageJson(rootPath, packageJson);
}

function getProxyOutputFolders(publicFileNames: string[]) {
  return Array.from(
    new Set(
      publicFileNames
        .map((name) => name.replace(/\/index$/, ""))
        .filter((name) => name !== "index")
        .map((name) => name.split("/")[0])
        .filter((name): name is string => !!name),
    ),
  );
}

function cleanLegacyOutput(rootPath: string, publicFileNames: string[]) {
  const folders = [cjsDir, esmDir, ...getProxyOutputFolders(publicFileNames)];

  for (const folder of folders) {
    rmSync(join(rootPath, folder), { recursive: true, force: true });
  }
}

// Keeps packages usable after the legacy CJS build runs. Delete this module
// when packages no longer produce cjs/esm/proxy output.
export function cleanLegacyBuild(rootPath: string, publicFileNames: string[]) {
  updateSourcePackageFields(rootPath);
  cleanLegacyOutput(rootPath, publicFileNames);
}

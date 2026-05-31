import { readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { join, sep } from "node:path";

export interface PackageJson {
  name: string;
  scripts?: Record<string, string>;
  exports?: Record<string, unknown>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  [key: string]: unknown;
}

export function normalizePath(path: string) {
  return path.split(sep).join("/");
}

/**
 * Reads the package.json file inside the provided package directory.
 */
export function readPackageJson(rootPath: string): PackageJson {
  const packageJsonPath = join(rootPath, "package.json");
  return JSON.parse(readFileSync(packageJsonPath, "utf-8"));
}

/**
 * Reads a package.json file from a fully resolved file path.
 */
export async function readPackageJsonAsync(path: string): Promise<PackageJson> {
  const contents = await readFile(path, "utf-8");
  return JSON.parse(contents);
}

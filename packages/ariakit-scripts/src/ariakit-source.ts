import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join, resolve } from "node:path";

interface PackageJson {
  name?: string;
  exports?: Record<string, unknown>;
}

interface ConditionalExport {
  "ariakit-source"?: unknown;
}

interface ViteAlias {
  find: RegExp;
  replacement: string;
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function isConditionalExport(value: unknown): value is ConditionalExport {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function getPackageJson(path: string): PackageJson {
  return JSON.parse(readFileSync(path, "utf8")) as PackageJson;
}

export function getAriakitSourceAliases(
  rootDir = resolve(import.meta.dirname, "../../.."),
) {
  const aliases: Record<string, string> = {};
  const packagesDir = join(rootDir, "packages");
  const packageDirs = readdirSync(packagesDir).sort();

  for (const packageDir of packageDirs) {
    const packageJsonPath = join(packagesDir, packageDir, "package.json");
    if (!existsSync(packageJsonPath)) continue;

    const packageJson = getPackageJson(packageJsonPath);
    if (!packageJson.name?.startsWith("@ariakit/")) continue;
    if (!isConditionalExport(packageJson.exports)) continue;

    const rootEntries: [string, string][] = [];
    const subpathEntries: [string, string][] = [];

    for (const [subpath, exportValue] of Object.entries(packageJson.exports)) {
      if (subpath === "./package.json") continue;
      if (!isConditionalExport(exportValue)) continue;

      const source = exportValue["ariakit-source"];
      if (typeof source !== "string") continue;

      const specifier =
        subpath === "."
          ? packageJson.name
          : `${packageJson.name}/${subpath.replace(/^\.\//, "")}`;
      const replacement = resolve(packagesDir, packageDir, source);
      const entries = subpath === "." ? rootEntries : subpathEntries;
      entries.push([specifier, replacement]);
    }

    for (const [specifier, replacement] of subpathEntries) {
      aliases[specifier] = replacement;
    }
    for (const [specifier, replacement] of rootEntries) {
      aliases[specifier] = replacement;
    }
  }

  return aliases;
}

export function getAriakitSourceAliasEntries(
  rootDir = resolve(import.meta.dirname, "../../.."),
): ViteAlias[] {
  return Object.entries(getAriakitSourceAliases(rootDir)).map(
    ([specifier, replacement]) => ({
      find: new RegExp(`^${escapeRegExp(specifier)}$`),
      replacement,
    }),
  );
}

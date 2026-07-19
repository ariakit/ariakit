import { lstatSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { build as rolldownBuild } from "rolldown";
import { dts } from "rolldown-plugin-dts";
import solidPlugin from "vite-plugin-solid";
import { cleanLegacyBuild } from "./legacy-clean.ts";
import { escapeRegExp } from "./regexp.ts";
import { normalizePath, readPackageJson } from "./utils.ts";
import type { PackageJson } from "./utils.ts";

interface PublicFile {
  name: string;
  path: string;
  source: string;
}

interface BuildOptions {
  indexOnly?: boolean;
  entries?: string[];
}

interface CleanOptions {
  indexOnly?: boolean;
  entries?: string[];
}

type ExportMode = "source" | "build";

const sourceDir = "src";
const distDir = "dist";
const solidDir = "solid";
const npmIgnoreEntries = [
  "coverage",
  "benchmark",
  "src/test.ts",
  "src/**/*.test.*",
  "src/**/__tests__/**",
  "tsconfig*.json",
  "*.log",
  "*.config.*",
  "*.lock",
];
// Use the neutral platform for published libraries so Rolldown doesn't inline
// runtime process.env.NODE_ENV checks for browser builds.
const buildPlatform = "neutral";

function removeExtension(path: string) {
  return path.replace(/\.[^.]+$/, "");
}

function isTypeScriptSource(filename: string) {
  return /\.[jt]sx?$/.test(filename);
}

function isPrivateModule(filename: string) {
  return filename.startsWith("__");
}

function matchesBasenamePattern(name: string, pattern: string) {
  if (!pattern.includes("*")) {
    return name === pattern;
  }

  const source = pattern.split("*").map(escapeRegExp).join(".*");
  return new RegExp(`^${source}$`).test(name);
}

// Keep npmIgnoreEntries within this small subset: *, **, and slash-free
// basename patterns. This is not a full gitignore parser.
function matchesPathPattern(parts: string[], patternParts: string[]): boolean {
  const pattern = patternParts[0];
  if (pattern == null) {
    return parts.length === 0;
  }

  if (pattern === "**") {
    const remainingPatternParts = patternParts.slice(1);
    if (!remainingPatternParts.length) return true;

    for (let i = 0; i <= parts.length; i += 1) {
      if (matchesPathPattern(parts.slice(i), remainingPatternParts)) {
        return true;
      }
    }

    return false;
  }

  const part = parts[0];
  if (part == null) return false;
  if (!matchesBasenamePattern(part, pattern)) return false;
  return matchesPathPattern(parts.slice(1), patternParts.slice(1));
}

function matchesNpmIgnoreEntry(path: string, entry: string) {
  const parts = path.split("/");

  if (!entry.includes("/")) {
    return parts.some((part) => matchesBasenamePattern(part, entry));
  }

  return matchesPathPattern(parts, entry.split("/"));
}

function isNpmIgnored(path: string) {
  return npmIgnoreEntries.some((entry) => matchesNpmIgnoreEntry(path, entry));
}

function writePackageJson(rootPath: string, packageJson: PackageJson) {
  const packageJsonPath = join(rootPath, "package.json");
  const currentContents = readFileSync(packageJsonPath, "utf-8");
  const nextContents = `${JSON.stringify(packageJson, null, 2)}\n`;
  const currentContentsMin = JSON.stringify(JSON.parse(currentContents));
  const nextContentsMin = JSON.stringify(JSON.parse(nextContents));
  if (currentContentsMin === nextContentsMin) return;
  writeFileSync(packageJsonPath, nextContents);
}

function isDirectory(path: string) {
  return lstatSync(path).isDirectory();
}

async function getPublicFiles(sourcePath: string, prefix = "") {
  const files: PublicFile[] = [];
  const entries = await readdir(sourcePath);
  const sortedEntries = entries.sort((a, b) => a.localeCompare(b));

  for (const entry of sortedEntries) {
    const entryPath = join(sourcePath, entry);
    const prefixedPath = join(prefix, entry);
    const source = normalizePath(join(sourceDir, prefixedPath));

    if (isNpmIgnored(source)) continue;
    if (isPrivateModule(entry)) continue;

    if (isDirectory(entryPath)) {
      const childFiles = await getPublicFiles(entryPath, prefixedPath);
      files.push(...childFiles);
      continue;
    }

    if (!isTypeScriptSource(entry)) continue;

    files.push({
      name: removeExtension(normalizePath(prefixedPath)),
      path: entryPath,
      source: `./${source}`,
    });
  }

  return files;
}

async function getEntryFiles(sourcePath: string, entryNames: string[]) {
  const files = await getPublicFiles(sourcePath);

  return entryNames.map((name) => {
    const file = files.find((file) => file.name === name);
    if (!file) {
      throw new Error(`Missing ${sourceDir}/${name} entrypoint`);
    }
    return file;
  });
}

function getExportName(name: string) {
  if (name === "index") return ".";
  return `./${name.replace(/\/index$/, "")}`;
}

function getExportValue(file: PublicFile, isSolid: boolean, mode: ExportMode) {
  if (mode === "source") return file.source;

  const name = file.name;
  return {
    types: `./${distDir}/${name}.d.ts`,
    ...(isSolid && { solid: `./${solidDir}/${name}.jsx` }),
    import: `./${distDir}/${name}.js`,
  };
}

function sortPublicFilesByExportName(publicFiles: PublicFile[]) {
  return [...publicFiles].sort((a, b) =>
    getExportName(a.name).localeCompare(getExportName(b.name)),
  );
}

function getPackageDependencies(packageJson: PackageJson) {
  return {
    ...packageJson.dependencies,
    ...packageJson.peerDependencies,
  };
}

function hasPackageDependency(packageJson: PackageJson, name: string) {
  return name in getPackageDependencies(packageJson);
}

function isSolidPackage(packageJson: PackageJson) {
  if (!packageJson.name.includes("/solid")) return false;
  return hasPackageDependency(packageJson, "solid-js");
}

async function updatePackageExports(
  rootPath: string,
  publicFiles: PublicFile[],
  mode: ExportMode,
) {
  const packageJson = readPackageJson(rootPath);
  const isSolid = isSolidPackage(packageJson);
  const sortedPublicFiles = sortPublicFilesByExportName(publicFiles);
  const exports = Object.fromEntries(
    sortedPublicFiles.map((file) => [
      getExportName(file.name),
      getExportValue(file, isSolid, mode),
    ]),
  );

  packageJson.exports = {
    ...exports,
    "./package.json": "./package.json",
  };

  writePackageJson(rootPath, packageJson);
}

// Resolve the explicit entry file names for a package, or null to export every
// public file. Reads `options` (from the CLI) first, then falls back to the
// `--entries`/`--index-only` markers in the package's own `build` script, so
// that `clean` — which lint-staged runs without those flags — applies the same
// entrypoints as `build`.
function getConfiguredEntryNames(
  packageJson: PackageJson,
  options: BuildOptions,
) {
  if (options.entries) return options.entries;
  if (options.indexOnly) return ["index"];
  const buildScript = packageJson.scripts?.build ?? "";
  const entriesMatch = buildScript.match(/--entries[=\s]+([\w,./-]+)/);
  if (entriesMatch?.[1]) return entriesMatch[1].split(",");
  if (buildScript.includes("--index-only")) return ["index"];
  return null;
}

async function getPackagePublicFiles(rootPath: string, options: BuildOptions) {
  const sourcePath = join(rootPath, sourceDir);
  const packageJson = readPackageJson(rootPath);
  const entryNames = getConfiguredEntryNames(packageJson, options);
  return entryNames
    ? await getEntryFiles(sourcePath, entryNames)
    : await getPublicFiles(sourcePath);
}

export async function updateSourcePackageJson(
  rootPath: string,
  options: CleanOptions = {},
) {
  const publicFiles = await getPackagePublicFiles(rootPath, options);
  await updatePackageExports(rootPath, publicFiles, "source");
  return publicFiles;
}

function getExternal(packageJson: PackageJson) {
  const dependencies = getPackageDependencies(packageJson);
  const packageNames = Object.keys(dependencies);

  return (id: string) => {
    return packageNames.some(
      (name) => id === name || id.startsWith(`${name}/`),
    );
  };
}

function getInput(publicFiles: PublicFile[]) {
  return Object.fromEntries(publicFiles.map((file) => [file.name, file.path]));
}

function cleanOutput(rootPath: string, isSolid: boolean) {
  const folders = [distDir, ...(isSolid ? [solidDir] : [])];
  for (const folder of folders) {
    rmSync(join(rootPath, folder), { recursive: true, force: true });
  }
}

function writeGitignore(rootPath: string, isSolid: boolean) {
  const folders = [distDir, ...(isSolid ? [solidDir] : [])];
  const contents = [
    "# Automatically generated",
    ...folders.map((folder) => `/${folder}`),
  ];
  writeFileSync(join(rootPath, ".gitignore"), `${contents.join("\n")}\n`);
}

function writeNpmignore(rootPath: string) {
  const contents = ["# Automatically generated", ...npmIgnoreEntries];
  writeFileSync(join(rootPath, ".npmignore"), `${contents.join("\n")}\n`);
}

async function buildSolidSource(
  rootPath: string,
  input: Record<string, string>,
) {
  await rolldownBuild({
    input,
    external: getExternal(readPackageJson(rootPath)),
    platform: buildPlatform,
    output: {
      dir: solidDir,
      cleanDir: true,
      format: "es",
      entryFileNames: "[name].jsx",
      chunkFileNames: "__chunks/[hash].jsx",
      sourcemap: true,
    },
  });
}

async function buildDist(rootPath: string, publicFiles: PublicFile[]) {
  const packageJson = readPackageJson(rootPath);
  const isReactPackage = packageJson.name.includes("/react");
  const isSolid = isSolidPackage(packageJson);
  const input = getInput(publicFiles);

  await rolldownBuild({
    input,
    external: getExternal(packageJson),
    platform: buildPlatform,
    output: {
      dir: distDir,
      cleanDir: true,
      format: "es",
    },
    plugins: [
      dts({
        emitDtsOnly: true,
        build: true,
        incremental: false,
        sourcemap: true,
      }),
    ],
  });

  await rolldownBuild({
    input,
    external: getExternal(packageJson),
    platform: buildPlatform,
    output: {
      dir: distDir,
      cleanDir: false,
      format: "es",
      entryFileNames: "[name].js",
      chunkFileNames: "__chunks/[hash].js",
      sourcemap: true,
      ...(isReactPackage && { banner: '"use client";' }),
    },
    plugins: [
      ...(isSolid ? [solidPlugin({ solid: { generate: "dom" } })] : []),
    ],
  });

  if (isSolid) {
    await buildSolidSource(rootPath, getInput(publicFiles));
  }
}

export async function build(options: BuildOptions = {}) {
  const rootPath = process.cwd();
  const packageJson = readPackageJson(rootPath);
  const isSolid = isSolidPackage(packageJson);

  const publicFiles = await getPackagePublicFiles(rootPath, options);

  await updatePackageExports(rootPath, publicFiles, "build");
  writeGitignore(rootPath, isSolid);
  writeNpmignore(rootPath);
  await buildDist(rootPath, publicFiles);
}

export async function clean(options: CleanOptions = {}) {
  const rootPath = process.cwd();
  await cleanPackage(rootPath, options);
}

export async function cleanPackage(
  rootPath: string,
  options: CleanOptions = {},
) {
  const packageJson = readPackageJson(rootPath);
  const isSolid = isSolidPackage(packageJson);
  const publicFiles = await updateSourcePackageJson(rootPath, options);
  cleanOutput(rootPath, isSolid);
  cleanLegacyBuild(
    rootPath,
    publicFiles.map((file) => file.name),
  );
}

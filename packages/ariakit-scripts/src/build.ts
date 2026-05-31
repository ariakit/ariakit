import {
  existsSync,
  lstatSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { readdir } from "node:fs/promises";
import { join, relative, sep } from "node:path";
import { build as rolldownBuild } from "rolldown";
import type { Plugin } from "rolldown";
import { dts } from "rolldown-plugin-dts";
import solidPlugin from "vite-plugin-solid";

interface PackageJson {
  name: string;
  scripts?: Record<string, string>;
  exports?: Record<string, unknown>;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  [key: string]: unknown;
}

interface PublicFile {
  name: string;
  path: string;
  source: string;
}

interface BuildOptions {
  indexOnly?: boolean;
}

interface CleanOptions {
  indexOnly?: boolean;
}

type ExportMode = "source" | "build";

const sourceDir = "src";
const distDir = "dist";
const solidDir = "solid";
// Use the neutral platform for published libraries so Rolldown doesn't inline
// runtime process.env.NODE_ENV checks for browser builds.
const buildPlatform = "neutral";

function normalizePath(path: string) {
  return path.split(sep).join("/");
}

function removeExtension(path: string) {
  return path.replace(/\.[^.]+$/, "");
}

function isTypeScriptSource(filename: string) {
  return /\.[jt]sx?$/.test(filename);
}

function isPrivateModule(filename: string) {
  return filename.startsWith("__");
}

function readPackageJson(rootPath: string): PackageJson {
  const packageJsonPath = join(rootPath, "package.json");
  return JSON.parse(readFileSync(packageJsonPath, "utf-8"));
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

async function getPublicFiles(
  sourcePath: string,
  rootPath: string,
  prefix = "",
) {
  const files: PublicFile[] = [];
  const entries = await readdir(sourcePath);
  const sortedEntries = entries.sort((a, b) => a.localeCompare(b));

  for (const entry of sortedEntries) {
    if (isPrivateModule(entry)) continue;

    const entryPath = join(sourcePath, entry);
    const prefixedPath = join(prefix, entry);

    if (isDirectory(entryPath)) {
      const childFiles = await getPublicFiles(
        entryPath,
        rootPath,
        prefixedPath,
      );
      files.push(...childFiles);
      continue;
    }

    if (!isTypeScriptSource(entry)) continue;

    files.push({
      name: removeExtension(normalizePath(prefixedPath)),
      path: entryPath,
      source: `./${normalizePath(relative(rootPath, entryPath))}`,
    });
  }

  return files;
}

async function getIndexFile(sourcePath: string, rootPath: string) {
  const files = await getPublicFiles(sourcePath, rootPath);
  const indexFile = files.find((file) => file.name === "index");

  if (!indexFile) {
    throw new Error(`Missing ${sourceDir}/index.ts entrypoint`);
  }

  return [indexFile];
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

function shouldUseIndexOnly(packageJson: PackageJson, options: BuildOptions) {
  if (options.indexOnly) return true;
  return packageJson.scripts?.build?.includes("--index-only") ?? false;
}

async function getPackagePublicFiles(rootPath: string, options: BuildOptions) {
  const sourcePath = join(rootPath, sourceDir);
  const packageJson = readPackageJson(rootPath);
  return shouldUseIndexOnly(packageJson, options)
    ? await getIndexFile(sourcePath, rootPath)
    : await getPublicFiles(sourcePath, rootPath);
}

export async function updateSourcePackageJson(
  rootPath: string,
  options: CleanOptions = {},
) {
  const publicFiles = await getPackagePublicFiles(rootPath, options);
  await updatePackageExports(rootPath, publicFiles, "source");
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

function getUseClientPlugin(enabled: boolean): Plugin[] {
  if (!enabled) return [];
  return [
    {
      name: "ariakit-use-client",
      renderChunk(code) {
        return `"use client";\n${code}`;
      },
    },
  ];
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
  const contents = [
    "# Automatically generated",
    "coverage",
    "benchmark",
    // Dev-only tooling (e.g. the Solid port scripts) kept outside `src`. Only
    // added for packages that actually have the directory, to avoid changing
    // other packages' generated ignore files.
    ...(existsSync(join(rootPath, "port-utils")) ? ["port-utils"] : []),
    "src/test.ts",
    "src/**/*.test.*",
    "src/**/__tests__/**",
    "tsconfig*.json",
    "*.log",
    "*.config.*",
    "*.lock",
  ];
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
    },
    plugins: [
      ...getUseClientPlugin(isReactPackage),
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
  await updateSourcePackageJson(rootPath, options);
  cleanOutput(rootPath, isSolid);
}

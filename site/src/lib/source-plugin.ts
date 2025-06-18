import fs from "node:fs";
import { basename, dirname, relative } from "node:path";
import { readPackageUpSync } from "read-pkg-up";
import resolveFrom from "resolve-from";
import type { PluginContext } from "rollup";
import ts from "typescript";
import type { Plugin } from "vite";
import type { Source } from "./types.ts";

// Cache for package information to avoid repeated lookups
const packageCache = new Map<string, any>();

// TypeScript compiler host for resolving modules
const host = ts.createCompilerHost({});

/**
 * Get the package version from the package.json
 */
function getPackageVersion(source: string) {
  const result = packageCache.get(source) || readPackageUpSync({ cwd: source });
  if (!result) return "latest";
  packageCache.set(source, result);
  const { version } = result.packageJson;
  if (!version) {
    console.log("No version found for", source);
  }
  return version || "latest";
}

/**
 * Get the package name from the package.json
 */
function getPackageName(source: string) {
  const result = packageCache.get(source) || readPackageUpSync({ cwd: source });
  if (!result) return null;
  packageCache.set(source, result);
  return result.packageJson.name;
}

/**
 * Remove framework-specific suffixes from a path
 */
function removeFrameworkSuffixes(filePath: string) {
  return filePath
    .replace(/\.preact\.([tj]sx?)$/, ".$1")
    .replace(/\.react\.([tj]sx?)$/, ".$1")
    .replace(/\.solid\.([tj]sx?)$/, ".$1");
}

/**
 * Remove framework-specific suffixes and replace ../ with ./
 */
function normalizeImportPath(importPath: string) {
  return removeFrameworkSuffixes(importPath).replace(/^(\.\.\/)+/, "./");
}

/**
 * Remove framework-specific suffixes and leading ./ or ../
 */
function normalizeFilename(filename: string) {
  return removeFrameworkSuffixes(filename).replace(/^(\.\.\/)+/, "");
}

/**
 * Convert absolute path to relative path without leading ./
 */
function getRelativePath(baseDir: string, filePath: string) {
  const relativePath = relative(baseDir, filePath);
  return relativePath.replace(/^\.{1,2}\//, "");
}

/**
 * Get all import paths from a string
 */
function getImportPaths(content: string) {
  const importExportRegex =
    /(?:import|export)\s*(?:[^'"]*?\s+from\s+|\(\s*)?["']([^'"]+)["']/g;

  const paths = new Set<string>();
  let match: RegExpExecArray | null;

  while ((match = importExportRegex.exec(content)) !== null) {
    if (match[1]) {
      paths.add(match[1]);
    }
  }

  return paths;
}

/**
 * Resolve an import to a full path
 */
async function resolveImport(
  context: PluginContext,
  id: string,
  importer: string,
) {
  const { resolvedModule } = ts.resolveModuleName(id, importer, {}, host);
  const external =
    resolvedModule?.isExternalLibraryImport ?? !id.startsWith(".");
  const resolved = await context.resolve(id, importer);
  if (!resolved) return null;
  const resolvedPath = external
    ? resolveFrom(dirname(importer), id)
    : resolved.id;
  return {
    id: external ? id : resolved.id,
    external: !!external,
    resolvedPath,
    resolvedModule,
  };
}

/**
 * Add a dependency to the source object
 */
async function addDependency(
  context: PluginContext,
  source: Source,
  id: string,
  importer: string,
  resolved?: Awaited<ReturnType<typeof resolveImport>>,
) {
  if (!resolved) {
    resolved = await resolveImport(context, id, importer);
  }
  if (!resolved) return;
  const packageName = getPackageName(resolved.resolvedPath);
  if (resolved.external && !source.dependencies[packageName]) {
    source.dependencies[packageName] = getPackageVersion(resolved.resolvedPath);
  }
  const typesPackageId = resolved.resolvedModule?.packageId?.name;
  const hasTypes = typesPackageId && !!typesPackageId.startsWith("@types/");
  const resolvedTypesPath = resolved.resolvedModule?.resolvedFileName;
  if (
    hasTypes &&
    resolvedTypesPath &&
    !source.devDependencies[typesPackageId]
  ) {
    source.devDependencies[typesPackageId] =
      getPackageVersion(resolvedTypesPath);
  }
}

/**
 * Add framework-specific dependencies based on file patterns
 */
async function addFrameworkDependencies(
  context: PluginContext,
  filePath: string,
  source: Source,
) {
  const filename = basename(filePath);
  if (filename.includes(".preact.tsx")) {
    await addDependency(context, source, "preact", filePath);
  }
  if (filename.includes(".react.tsx")) {
    await addDependency(context, source, "react", filePath);
    await addDependency(context, source, "react-dom", filePath);
  }
  if (filename.includes(".solid.tsx")) {
    await addDependency(context, source, "solid-js", filePath);
  }
}

/**
 * Process a single file and extract its dependencies
 */
async function processFile(
  context: PluginContext,
  source: Source,
  id: string,
  baseDir = dirname(id),
  processedModules = new Set<string>(),
) {
  // Skip if already processed to avoid circular dependencies
  if (processedModules.has(id)) return;
  processedModules.add(id);
  context.addWatchFile(id);

  const content = await fs.promises.readFile(id, "utf-8");
  const filename = normalizeFilename(getRelativePath(baseDir, id));
  source.files[filename] = content;

  await addFrameworkDependencies(context, id, source);

  const imports = getImportPaths(content);

  for (const importPath of imports) {
    const normalizedImportPath = normalizeImportPath(importPath);
    source.files[filename] = source.files[filename].replaceAll(
      importPath,
      normalizedImportPath,
    );

    const resolved = await resolveImport(context, importPath, id);
    if (!resolved) continue;

    if (resolved.external) {
      await addDependency(context, source, importPath, id, resolved);
    } else if (!processedModules.has(resolved.id)) {
      // Process local dependency recursively
      await processFile(
        context,
        source,
        resolved.id,
        baseDir,
        processedModules,
      );
    }
  }
}

/**
 * Custom plugin to extract source code and dependencies using Vite's module
 * graph
 */
export function sourcePlugin(root?: string): Plugin {
  const queryString = "?source";

  return {
    name: "vite-plugin-source",

    async load(id) {
      if (!id.endsWith(queryString)) return;
      const realId = id.replace(queryString, "");

      const source: Source = {
        name: dirname(id).replace(root ?? "", ""),
        files: {},
        dependencies: {},
        devDependencies: {},
      };

      await processFile(this, source, realId);

      return `export default ${JSON.stringify(source, null, 2)}`;
    },
  };
}

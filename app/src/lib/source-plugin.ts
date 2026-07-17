/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

import { createHash } from "node:crypto";
import fs from "node:fs";
import { basename, dirname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolve as resolveImportMeta } from "import-meta-resolve";
import * as prettier from "prettier";
import { readPackageUpSync } from "read-package-up";
import ts from "typescript";
import type { HookHandler, Plugin } from "vite";
import {
  getFramework,
  getFrameworkByFilename,
  removeFrameworkSuffix,
} from "./frameworks.ts";
import {
  findNestedRouteFiles,
  findSiblingConventionFiles,
  isNextjsConventionFile,
} from "./nextjs.ts";
import type { Source, SourceFile } from "./source.ts";
import { getImportPaths, replaceImportPaths } from "./source.ts";

const APP_LIB_PATH = join(import.meta.dirname, "../examples/_lib");
const NEXTJS_LIB_PATH = join(import.meta.dirname, "../../../nextjs/components");

// Cache for package information to avoid repeated lookups
const packageCache = new Map<
  string,
  NonNullable<ReturnType<typeof readPackageUpSync>> | null
>();

// TypeScript compiler host for resolving modules
const host = ts.createCompilerHost({});

// Cache processed source files (original content + local deps) keyed by abs id
interface CachedFileData {
  file: SourceFile;
  localDeps: string[];
}

const fileProcessCache = new Map<string, CachedFileData>();

// Cache generated flattened file contents keyed by abs id + content hash. The
// files record key depends on baseDir, so recompute it on each call.
const flattenedFileCache = new Map<string, SourceFile>();

type SourcePluginContext = ThisParameterType<
  HookHandler<NonNullable<Plugin["load"]>>
>;

/**
 * Compute a stable hash for a given string content.
 */
function hashContent(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

function cacheKeyForFile(id: string, content: string) {
  return `${id}?h=${hashContent(content)}`;
}

function getPackage(source: string) {
  const packageDir = dirname(source);
  if (packageCache.has(packageDir)) {
    return packageCache.get(packageDir) ?? null;
  }
  const result = readPackageUpSync({ cwd: packageDir }) ?? null;
  packageCache.set(packageDir, result);
  return result;
}

/**
 * Get the package version from the package.json
 */
function getPackageVersion(source: string) {
  const result = getPackage(source);
  if (!result) return "latest";
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
  const result = getPackage(source);
  if (!result) return null;
  return result.packageJson.name;
}

/**
 * Whether a path references a local library file.
 */
function isLibPath(path: string) {
  return (
    path.startsWith("#") ||
    path.startsWith(APP_LIB_PATH) ||
    path.startsWith(NEXTJS_LIB_PATH)
  );
}

/**
 * Normalize a filename to a basename without framework suffix and relative path.
 */
function normalizeFilename(filename: string, baseDir: string) {
  const noFrameworkSuffix = removeFrameworkSuffix(filename);
  if (isLibPath(noFrameworkSuffix)) {
    return basename(noFrameworkSuffix);
  }
  return relative(baseDir, noFrameworkSuffix).replace(/^(\.\.?\/)+/, "");
}

/**
 * Remove framework-specific suffixes and replace ../ with ./
 */
function normalizeImportPath(importPath: string) {
  const noFrameworkSuffix = removeFrameworkSuffix(importPath);
  // Treat # aliases as local and collapse path to just the filename
  if (isLibPath(noFrameworkSuffix)) {
    return `./${basename(noFrameworkSuffix)}`;
  }
  // Any relative path outside the current directory should be reduced to just
  // the basename to match flattened output.
  if (/^\.\.\//.test(noFrameworkSuffix)) {
    return `./${basename(noFrameworkSuffix)}`;
  }
  return noFrameworkSuffix;
}

/**
 * Choose a Prettier parser based on filename
 */
function getPrettierParserFromFilename(
  filename: string,
): "typescript" | "babel" | null {
  if (/\.(ts|tsx)$/.test(filename)) return "typescript";
  if (/\.(js|jsx)$/.test(filename)) return "babel";
  return null;
}

/**
 * Format code with Prettier respecting local configuration
 */
async function formatWithPrettier(
  code: string,
  filePath: string,
  filenameForParser: string,
) {
  const parser = getPrettierParserFromFilename(filenameForParser);
  if (!parser) return code;
  try {
    const resolvedConfig = (await prettier.resolveConfig(filePath)) ?? {};
    return await prettier.format(code, {
      ...resolvedConfig,
      filepath: filePath,
      parser,
    });
  } catch {
    // Fail silently: if Prettier isn't available or config fails, return unformatted code
    return code;
  }
}

/**
 * Resolve an external import path
 */
function resolveExternalImportPath(id: string, importer: string) {
  const importerUrl = pathToFileURL(importer).href;
  const resolved = resolveImportMeta(id, importerUrl);
  if (resolved.startsWith("file:")) {
    return fileURLToPath(resolved);
  }
  return resolved;
}

/**
 * Resolve an import to a full path
 */
async function resolveImport(
  context: SourcePluginContext,
  id: string,
  importer: string,
) {
  const { resolvedModule } = ts.resolveModuleName(id, importer, {}, host);
  const external =
    resolvedModule?.isExternalLibraryImport ??
    (!id.startsWith(".") && !isLibPath(id));
  if (external) {
    return {
      id,
      external: true,
      resolvedPath: resolveExternalImportPath(id, importer),
      resolvedModule,
    };
  }
  const resolved = await context.resolve(id, importer);
  if (!resolved) return null;
  return {
    id: resolved.id,
    external: false,
    resolvedPath: resolved.id,
    resolvedModule,
  };
}

/**
 * Add a dependency to the source object
 */
function collectDependencyFromResolved(
  file: SourceFile,
  resolved: NonNullable<Awaited<ReturnType<typeof resolveImport>>>,
) {
  const packageName = getPackageName(resolved.resolvedPath);
  if (resolved.external && packageName) {
    file.dependencies ??= {};
    if (!file.dependencies[packageName]) {
      file.dependencies[packageName] = getPackageVersion(resolved.resolvedPath);
    }
  }
  const typesPackageId = resolved.resolvedModule?.packageId?.name;
  const hasTypes = typesPackageId && typesPackageId.startsWith("@types/");
  const resolvedTypesPath = resolved.resolvedModule?.resolvedFileName;
  if (hasTypes && resolvedTypesPath) {
    file.devDependencies ??= {};
    if (!file.devDependencies[typesPackageId]) {
      file.devDependencies[typesPackageId] =
        getPackageVersion(resolvedTypesPath);
    }
  }
}

async function addFrameworkDependenciesToFile(
  context: SourcePluginContext,
  filePath: string,
  file: SourceFile,
) {
  const filename = basename(filePath);
  const frameworkName = getFrameworkByFilename(filename);
  if (!frameworkName) return;
  const framework = getFramework(frameworkName);
  for (const dependency of framework.dependencies) {
    const resolved = await resolveImport(context, dependency, filePath);
    if (!resolved) continue;
    collectDependencyFromResolved(file, resolved);
  }
}

/**
 * Load a source file and collect local dependency ids. Uses a cache keyed by
 * absolute file id. The returned `file` is unmodified and suitable for
 * placement under `source.sources`.
 */
async function loadSourceFileCached(
  context: SourcePluginContext,
  id: string,
): Promise<CachedFileData> {
  const content = await fs.promises.readFile(id, "utf-8");
  const cacheKey = cacheKeyForFile(id, content);
  const cached = fileProcessCache.get(cacheKey);
  if (cached) return cached;
  const fileRef: SourceFile = { id, content };
  await addFrameworkDependenciesToFile(context, id, fileRef);
  const localDeps: string[] = [];
  const imports = getImportPaths(content);
  for (const importPath of imports) {
    const resolved = await resolveImport(context, importPath, id);
    if (!resolved) continue;
    if (resolved.external) {
      collectDependencyFromResolved(fileRef, resolved);
      continue;
    }
    localDeps.push(resolved.id);
  }
  const data: CachedFileData = { file: fileRef, localDeps };
  fileProcessCache.set(cacheKey, data);
  return data;
}

/**
 * Process a single file and extract its dependencies
 */
async function processFile(
  context: SourcePluginContext,
  source: Source,
  id: string,
  processedModules = new Set<string>(),
) {
  // Skip if already processed to avoid circular dependencies
  if (processedModules.has(id)) return;
  processedModules.add(id);
  context.addWatchFile(id);
  const data = await loadSourceFileCached(context, id);
  source.sources[id] = data.file;
  for (const depId of data.localDeps) {
    if (!processedModules.has(depId)) {
      await processFile(context, source, depId, processedModules);
    }
  }
}

/**
 * Build a flattened files map and ensure no duplicate basenames are produced.
 */
async function buildFlattenedFiles(
  baseDir: string,
  input: Record<string, SourceFile>,
) {
  const files: Record<string, SourceFile> = {};
  for (const file of Object.values(input)) {
    const { key, file: generated } = await generateFlattenedFileCached(
      baseDir,
      file,
    );
    const previous = files[key];
    if (previous) {
      throw new Error(
        `Duplicate filename after flattening: ${key} (from ${previous.id} and ${file.id})`,
      );
    }
    files[key] = generated;
  }
  return files;
}

/**
 * Compute top-level dependency maps by unioning per-file maps.
 */
function computeTopLevelDependencies(files: Record<string, SourceFile>) {
  const deps: Record<string, string> = {};
  const devDeps: Record<string, string> = {};
  for (const f of Object.values(files)) {
    for (const [name, version] of Object.entries(f.dependencies ?? {})) {
      if (deps[name] == null) deps[name] = version;
    }
    for (const [name, version] of Object.entries(f.devDependencies ?? {})) {
      if (devDeps[name] == null) devDeps[name] = version;
    }
  }
  return { deps, devDeps };
}

/**
 * Generate a flattened file (final files record entry) from a source file.
 * Uses a cache keyed by absolute id.
 */
async function generateFlattenedFileCached(baseDir: string, file: SourceFile) {
  const cacheKey = cacheKeyForFile(file.id, file.content);
  const filename = normalizeFilename(file.id, baseDir);
  const cached = flattenedFileCache.get(cacheKey);
  if (cached) return { key: filename, file: cached };
  let content = replaceImportPaths(file.content, (path) =>
    normalizeImportPath(path),
  );
  if (content !== file.content) {
    content = await formatWithPrettier(content, file.id, basename(filename));
  }
  const generated: SourceFile = {
    id: file.id,
    content,
    dependencies: file.dependencies,
    devDependencies: file.devDependencies,
  };
  flattenedFileCache.set(cacheKey, generated);
  return { key: filename, file: generated };
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
        name: dirname(id)
          .replace(root ?? "", "")
          .replace(/^.+\/nextjs\/app\//, ""),
        sources: {},
        dependencies: {},
        devDependencies: {},
        files: {},
      };

      // Process the entry file first
      await processFile(this, source, realId);

      // If this is a Next.js convention file, auto-include siblings and nested
      // routes
      const entryFilename = basename(realId);
      if (isNextjsConventionFile(entryFilename)) {
        const entryDir = dirname(realId);

        // Find and process sibling convention files
        const siblingFiles = await findSiblingConventionFiles(realId);
        for (const siblingPath of siblingFiles) {
          await processFile(this, source, siblingPath);
        }

        // Find and process nested route files
        const nestedFiles = await findNestedRouteFiles(entryDir);
        for (const nestedPath of nestedFiles) {
          await processFile(this, source, nestedPath);
        }
      }

      // Build files by normalizing paths
      const baseDir = dirname(realId);
      const files = await buildFlattenedFiles(baseDir, source.sources);

      // Compute top-level dependencies/devDependencies from files
      const { deps: topDeps, devDeps: topDevDeps } =
        computeTopLevelDependencies(files);
      source.files = files;
      source.dependencies = topDeps;
      source.devDependencies = topDevDeps;

      return `export default ${JSON.stringify(source, null, 2)}`;
    },
  };
}

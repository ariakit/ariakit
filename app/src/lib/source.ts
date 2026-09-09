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
import { basename, dirname, relative } from "node:path";
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
} from "./framework.ts";
import {
  findNestedRouteFiles,
  findSiblingConventionFiles,
  isNextjsConventionFile,
} from "./nextjs.ts";

// ============================================================================
// Regex Patterns
// ============================================================================

// Shared quoted path fragment to capture module specifiers and preserve quote
// type. Supports single quotes, double quotes, and template literals (without
// interpolation).
const PATH_QUOTED = String.raw`(?:'(?<single>[^']+)'|"(?<double>[^"]+)"|\`(?<template>(?:[^\`$]|\$(?!\{))+?)\`)`;
const FROM_CLAUSE = String.raw`\s+from\s+${PATH_QUOTED}`;
const IMPORT_ATTRIBUTES = String.raw`(?<attributes>\s+(?:with|assert)\s+\{[\s\S]*?\})?`;

// Import patterns
const IMPORT_SIDE_EFFECT = new RegExp(
  String.raw`import\s+${PATH_QUOTED}${IMPORT_ATTRIBUTES}[\t ]*;?`,
  "g",
);
const IMPORT_NAMED = new RegExp(
  String.raw`import\s+(?!type\b)\{[\s\S]*?\}${FROM_CLAUSE}${IMPORT_ATTRIBUTES}[\t ]*;?`,
  "g",
);
const IMPORT_FROM_ANY = new RegExp(
  String.raw`import\s+(?!type\b)[^;]*?${FROM_CLAUSE}${IMPORT_ATTRIBUTES}[\t ]*;?`,
  "g",
);
const IMPORT_TYPE_NAMED = new RegExp(
  String.raw`import\s+type\s+\{[\s\S]*?\}${FROM_CLAUSE}${IMPORT_ATTRIBUTES}[\t ]*;?`,
  "g",
);
const IMPORT_TYPE_NAMESPACE = new RegExp(
  String.raw`import\s+type\s+\*\s+as\s+[^;]*?${FROM_CLAUSE}${IMPORT_ATTRIBUTES}[\t ]*;?`,
  "g",
);
const IMPORT_DYNAMIC = new RegExp(
  String.raw`\bimport\s*\(\s*${PATH_QUOTED}\s*\)`,
  "g",
);

// Export patterns
const EXPORT_FROM_NAMED = new RegExp(
  String.raw`export\s+\{[\s\S]*?\}${FROM_CLAUSE}`,
  "g",
);
const EXPORT_TYPE_NAMED = new RegExp(
  String.raw`export\s+type\s+\{[\s\S]*?\}${FROM_CLAUSE}`,
  "g",
);
const EXPORT_FROM_ALL = new RegExp(
  String.raw`export\s+\*[^;]*?${FROM_CLAUSE}`,
  "g",
);

// ============================================================================
// Types
// ============================================================================

export interface SourceFile {
  id: string;
  content: string;
  /**
   * External runtime dependencies referenced by this file, keyed by package
   * name with the resolved version as value.
   */
  dependencies?: Record<string, string>;
  /**
   * External dev-only dependencies (currently only @types/*) referenced by this
   * file, keyed by package name with the resolved version as value.
   */
  devDependencies?: Record<string, string>;
}

export interface Source {
  /** The name of the source. */
  name: string;
  /**
   * Dependencies of the source. The key is the name of the dependency and the
   * value is the version.
   */
  dependencies: Record<string, string>;
  /**
   * Development dependencies of the source. The key is the name of the
   * dependency and the value is the version.
   */
  devDependencies: Record<string, string>;
  /** Original unmodified files keyed by absolute id. */
  sources: Record<string, SourceFile>;
  /**
   * Files referenced by the source code where the key is the final relative
   * path to the file.
   */
  files: Record<string, SourceFile>;
}

export type ImportPathType =
  | "import"
  | "import-type"
  | "import-dynamic"
  | "export"
  | "export-type"
  | "export-all";

// Central registry of patterns and their classification
const PATTERNS: Array<[RegExp, ImportPathType]> = [
  [IMPORT_TYPE_NAMED, "import-type"],
  [IMPORT_TYPE_NAMESPACE, "import-type"],
  [IMPORT_DYNAMIC, "import-dynamic"],
  [IMPORT_FROM_ANY, "import"],
  [IMPORT_SIDE_EFFECT, "import"],
  [EXPORT_FROM_NAMED, "export"],
  [EXPORT_TYPE_NAMED, "export-type"],
  [EXPORT_FROM_ALL, "export-all"],
];

// ============================================================================
// Module Path Extraction Helpers
// ============================================================================

/**
 * Extracts the module path from regex match groups (single/double/template).
 */
function getPathFromGroups(
  groups: RegExpExecArray["groups"],
): string | undefined {
  return groups?.single ?? groups?.double ?? groups?.template;
}

/**
 * Determines the quote character used in regex match groups. Defaults to double
 * quote if no match found.
 */
function getQuoteFromGroups(groups: RegExpExecArray["groups"]): string {
  if (groups?.single != null) return "'";
  if (groups?.double != null) return '"';
  return "`";
}

/**
 * Extracts the comma-separated specifier text inside braces from an import-like
 * declaration string.
 * @example
 * extractSpecifiersInsideBraces('import { A, type B } from "mod";')
 * // Returns "A, type B"
 */
function extractSpecifiersInsideBraces(matchText: string): string | null {
  // Match ` from ` followed by a quote to avoid matching "from" inside
  // identifiers (e.g., `transformFrom`)
  const fromIndex = matchText.search(/\sfrom\s+['"`]/);
  if (fromIndex < 0) return null;
  const beforeFrom = matchText.slice(0, fromIndex);
  const braceStart = beforeFrom.indexOf("{");
  const braceEnd = beforeFrom.lastIndexOf("}");
  if (braceStart < 0 || braceEnd < 0) return null;
  return beforeFrom.slice(braceStart + 1, braceEnd);
}

// ============================================================================
// Public API: Import Path Operations
// ============================================================================

/**
 * Returns the set of module specifiers found in the given `content` across
 * imports, dynamic imports, and re-exports. Inline `type` specifiers within
 * named imports/exports are also considered for their corresponding type kind.
 * @param content - The source code to analyze
 * @param filter - Optional filter to include only specific paths/types
 */
export function getImportPaths(
  content: string,
  filter?: (path: string, type: ImportPathType) => boolean,
): Set<string> {
  const paths = new Set<string>();

  const addPathsFromPattern = (pattern: RegExp, type: ImportPathType) => {
    for (const match of content.matchAll(pattern)) {
      const path = getPathFromGroups(match.groups);
      if (!path) continue;
      if (filter && !filter(path, type)) continue;
      paths.add(path);
    }
  };

  // Process all standard patterns
  for (const [pattern, type] of PATTERNS) {
    addPathsFromPattern(pattern, type);
  }

  // Handle inline type specifiers mixed with value imports/exports:
  // - import { A, type B } from "..." → also count as import-type
  // - export { A, type T } from "..." → also count as export-type
  const addInlineTypeSpecifiers = (pattern: RegExp, type: ImportPathType) => {
    for (const match of content.matchAll(pattern)) {
      const path = getPathFromGroups(match.groups);
      if (!path) continue;

      const inside = extractSpecifiersInsideBraces(match[0]);
      if (inside == null) continue;
      if (!/\btype\b/.test(inside)) continue;

      if (filter && !filter(path, type)) continue;
      paths.add(path);
    }
  };

  addInlineTypeSpecifiers(IMPORT_NAMED, "import-type");
  addInlineTypeSpecifiers(EXPORT_FROM_NAMED, "export-type");

  return paths;
}

/**
 * Replaces module specifiers in any import/export form using the provided
 * `replacer(path, type)` function. Only the quoted path segment is changed so
 * surrounding code remains untouched.
 * @param content - The source code to transform
 * @param replacer - Function that returns the new path for each module
 */
export function replaceImportPaths(
  content: string,
  replacer: (path: string, type: ImportPathType) => string,
): string {
  let result = content;

  const replacePathsForPattern = (pattern: RegExp, type: ImportPathType) => {
    result = result.replace(pattern, (match, ...args) => {
      const groups = args[args.length - 1] as RegExpExecArray["groups"];
      const path = getPathFromGroups(groups);
      if (!path) return match;

      const newPath = replacer(path, type);
      if (newPath === path) return match;

      // Replace only the quoted path segment to preserve surrounding code
      const quote = getQuoteFromGroups(groups);
      const original = `${quote}${path}${quote}`;
      const replacement = `${quote}${newPath}${quote}`;
      const index = match.indexOf(original);
      if (index < 0) return match;

      return (
        match.slice(0, index) +
        replacement +
        match.slice(index + original.length)
      );
    });
  };

  for (const [pattern, type] of PATTERNS) {
    replacePathsForPattern(pattern, type);
  }

  return result;
}

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
  return path.startsWith("#");
}

/**
 * Normalize a filename to a basename without framework suffix and relative
 * path.
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
 * Format code with Prettier defaults
 *
 * No Prettier config is resolved on purpose. The repository has none, so a
 * lookup could only pick one up from outside the checkout and make the source
 * we publish depend on the machine building it. Defaults keep the output
 * identical everywhere, and class names stay in the order the example wrote
 * them.
 */
async function formatWithPrettier(code: string, filenameForParser: string) {
  const parser = getPrettierParserFromFilename(filenameForParser);
  if (!parser) return code;
  try {
    return await prettier.format(code, { parser });
  } catch {
    // Fail silently: a formatting error should not take down the page build,
    // and unformatted source still renders correctly.
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
 * Generate a flattened file (final files record entry) from a source file. Uses
 * a cache keyed by absolute id.
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
    content = await formatWithPrettier(content, basename(filename));
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

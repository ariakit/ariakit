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
import { basename, dirname, relative, resolve } from "node:path";
import prettier from "prettier";
import { readPackageUpSync } from "read-pkg-up";
import resolveFrom from "resolve-from";
import type { PluginContext } from "rollup";
import ts from "typescript";
import type { Plugin } from "vite";
import {
  getFramework,
  getFrameworkByFilename,
  removeFrameworkSuffix,
} from "./frameworks.ts";
import type { Source, SourceFile } from "./source.ts";
import { getImportPaths, mergeFiles, replaceImportPaths } from "./source.ts";
import { resolveStyles } from "./styles.ts";

// Cache for package information to avoid repeated lookups
const packageCache = new Map<string, any>();

// TypeScript compiler host for resolving modules
const host = ts.createCompilerHost({});

// Cache processed source files (original content + local deps) keyed by abs id
interface CachedFileData {
  file: SourceFile;
  localDeps: string[];
}
const fileProcessCache = new Map<string, CachedFileData>();

// Cache generated flattened files (final files record entries), keyed by abs id
interface FlattenedCacheData {
  key: string; // files record key (basename)
  file: SourceFile; // flattened content and metadata
}
const flattenedFileCache = new Map<string, FlattenedCacheData>();
/**
 * Compute a stable hash for a given string content.
 */
function hashContent(content: string) {
  return createHash("sha256").update(content).digest("hex");
}

function cacheKeyForFile(id: string, content: string) {
  return `${id}?h=${hashContent(content)}`;
}

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
 * Whether an import path uses the package.json imports map alias (starts with #)
 */
function isImportMapAliasPath(importPath: string) {
  return importPath.startsWith("#");
}

/**
 * Normalize path separators to posix style.
 */
function toPosixPath(filePath: string) {
  return filePath.replace(/\\/g, "/");
}

/**
 * Whether a path is inside a "*-utils" directory tree.
 */
function isUtilsPath(filePath: string) {
  const posix = toPosixPath(filePath);
  return /(\/?|^)[^/]*-utils(\/|$)/.test(posix);
}

/**
 * Remove framework-specific suffixes and replace ../ with ./
 */
function normalizeImportPath(importPath: string) {
  const noFrameworkSuffix = removeFrameworkSuffix(importPath);
  // Treat # aliases as local and collapse path to just the filename
  if (isImportMapAliasPath(noFrameworkSuffix)) {
    return `./${basename(noFrameworkSuffix)}`;
  }
  // Any relative path should be reduced to just the basename to match flattened output
  if (/^\./.test(noFrameworkSuffix)) {
    return `./${basename(noFrameworkSuffix)}`;
  }
  return noFrameworkSuffix;
}

/**
 * Remove framework-specific suffixes and leading ./ or ../
 */
function normalizeFilename(filename: string) {
  return removeFrameworkSuffix(filename).replace(/^(\.\.\/)+/, "");
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
    return await prettier.format(code, { ...resolvedConfig, parser });
  } catch {
    // Fail silently: if Prettier isn't available or config fails, return unformatted code
    return code;
  }
}

/**
 * Convert absolute path to relative path without leading ./
 */
function getRelativePath(baseDir: string, filePath: string) {
  const relativePath = relative(baseDir, filePath);
  return relativePath.replace(/^\.{1,2}\//, "");
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
    resolvedModule?.isExternalLibraryImport ??
    (!id.startsWith(".") && !isImportMapAliasPath(id));
  if (external) {
    return {
      id,
      external: true,
      resolvedPath: resolveFrom(dirname(importer), id),
      resolvedModule,
    };
  }
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
  const hasTypes = typesPackageId && !!typesPackageId.startsWith("@types/");
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
  context: PluginContext,
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
  context: PluginContext,
  id: string,
): Promise<CachedFileData> {
  const content = await fs.promises.readFile(id, "utf-8");
  const cacheKey = cacheKeyForFile(id, content);
  const cached = fileProcessCache.get(cacheKey);
  if (cached) return cached;
  const fileRef: SourceFile = { id, content };
  fileRef.styles = resolveStyles(content);
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

// (legacy helper removed)

/**
 * Process a single file and extract its dependencies
 */
async function processFile(
  context: PluginContext,
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
 * Builds a temporary files map where any `#` alias specifiers that resolve to
 * local files within the current graph are rewritten to relative specifiers
 * from the importer file. This allows mergeFiles() to recognize and rewrite
 * named imports that target utils members.
 */
async function rewriteAliasesToRelativeForMerge(
  context: PluginContext,
  files: Record<string, SourceFile>,
) {
  const out: Record<string, SourceFile> = {};
  for (const [absId, file] of Object.entries(files)) {
    const aliasPaths = Array.from(
      getImportPaths(file.content, (p) => isImportMapAliasPath(p)),
    );
    if (aliasPaths.length === 0) {
      out[absId] = file;
      continue;
    }
    const replacement = new Map<string, string>();
    for (const a of aliasPaths) {
      const resolved = await resolveImport(context, a, absId);
      if (!resolved) continue;
      const targetId = resolved.id;
      if (!files[targetId]) continue; // only rewrite if inside graph
      const dir = dirname(absId);
      let rel = toPosixPath(relative(dir, targetId));
      if (!rel.startsWith(".")) rel = `./${rel}`;
      replacement.set(a, rel);
    }
    if (replacement.size === 0) {
      out[absId] = file;
      continue;
    }
    const nextContent = replaceImportPaths(file.content, (p) => {
      const r = replacement.get(p);
      if (r) return r;
      return p;
    });
    out[absId] = {
      id: file.id,
      content: nextContent,
      styles: file.styles,
      dependencies: file.dependencies,
      devDependencies: file.devDependencies,
    };
  }
  return out;
}

/**
 * Compute the common ancestor directory for a list of absolute file ids.
 */
function getCommonAncestorDir(fileIds: string[]) {
  if (fileIds.length === 0) return "/";
  const splitDirSegments = (p: string) =>
    toPosixPath(dirname(p)).split("/").filter(Boolean);
  const segmentLists = fileIds.map(splitDirSegments);
  const minLength = segmentLists.reduce(
    (min, segs) => (segs.length < min ? segs.length : min),
    Number.POSITIVE_INFINITY,
  );
  const common: string[] = [];
  const firstSegments = segmentLists[0] || [];
  for (let i = 0; i < minLength; i++) {
    const segmentAtIndex = firstSegments[i];
    if (!segmentAtIndex) break;
    let allMatch = true;
    for (let j = 1; j < segmentLists.length; j++) {
      const segs = segmentLists[j];
      if (!segs || segs[i] !== segmentAtIndex) {
        allMatch = false;
        break;
      }
    }
    if (!allMatch) break;
    common.push(segmentAtIndex);
  }
  return `/${common.join("/")}`;
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
 * Move utils.ts entry to the end of the files map if present.
 */
function moveUtilsToEnd(files: Record<string, SourceFile>) {
  if (!("utils.ts" in files)) return files;
  const utilsFile = files["utils.ts"];
  if (!utilsFile) return files;
  delete files["utils.ts"];
  files["utils.ts"] = utilsFile;
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
 * Compute styles used by the source based on ak-* tokens in original sources.
 */
function computeSourceStylesFromSources(sources: Record<string, SourceFile>) {
  const contents = Object.values(sources).map((f) => f.content);
  return resolveStyles(...contents);
}

/**
 * Generate a flattened file (final files record entry) from a source file.
 * Uses a cache keyed by absolute id.
 */
async function generateFlattenedFileCached(baseDir: string, file: SourceFile) {
  const cacheKey = cacheKeyForFile(file.id, file.content);
  const cached = flattenedFileCache.get(cacheKey);
  if (cached) return cached;
  const rel = normalizeFilename(getRelativePath(baseDir, file.id));
  const filename = basename(rel);
  let content = replaceImportPaths(file.content, normalizeImportPath);
  if (content !== file.content) {
    content = await formatWithPrettier(content, file.id, filename);
  }
  const out: FlattenedCacheData = {
    key: filename,
    file: {
      id: file.id,
      content,
      styles: file.styles,
      dependencies: file.dependencies,
      devDependencies: file.devDependencies,
    },
  };
  flattenedFileCache.set(cacheKey, out);
  return out;
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
        sources: {},
        dependencies: {},
        devDependencies: {},
        styles: [],
        files: {},
      };

      await processFile(this, source, realId);

      // Determine utils to merge (only those actually imported / present)
      const utilsIds = Object.keys(source.sources).filter((abs) =>
        isUtilsPath(abs),
      );

      // Pre-resolve alias (#...) imports to relative specifiers for merge phase
      const preMerge = await rewriteAliasesToRelativeForMerge(
        this,
        source.sources,
      );

      let merged: Record<string, SourceFile> = preMerge;
      if (utilsIds.length > 0) {
        // Compute common ancestor directory for all utils members
        const commonDir = getCommonAncestorDir(utilsIds);
        const target = resolve(commonDir, "utils.ts");

        merged = mergeFiles(preMerge, (p) => {
          if (isUtilsPath(p)) return target;
          return false;
        });
      }

      // Build files by normalizing paths and flattening to basenames
      const baseDir = dirname(realId);
      const files = await buildFlattenedFiles(baseDir, merged);

      // Move merged utils.ts to the end if present
      moveUtilsToEnd(files);

      // Compute top-level dependencies/devDependencies from files
      const { deps: topDeps, devDeps: topDevDeps } =
        computeTopLevelDependencies(files);
      source.files = files;
      source.dependencies = topDeps;
      source.devDependencies = topDevDeps;

      // Resolve styles used by this source based on ak-* tokens found in original sources
      source.styles = computeSourceStylesFromSources(source.sources);

      return `export default ${JSON.stringify(source, null, 2)}`;
    },
  };
}

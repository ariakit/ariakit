import fs from "node:fs";
import { basename, dirname, relative, resolve } from "node:path";
import type { ImportDeclaration, ImportExpression, Node } from "estree";
import { visit } from "estree-util-visit";
import { readPackageUpSync } from "read-pkg-up";
import resolveFrom from "resolve-from";
import type { PluginContext } from "rollup";
import ts from "typescript";
import type { Plugin } from "vite";

export interface Source {
  files: Record<string, string>;
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

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
  return removeFrameworkSuffixes(importPath).replace(/^\.\.\//, "./");
}

/**
 * Remove framework-specific suffixes and leading ./ or ../
 */
function normalizeFilename(filename: string) {
  return removeFrameworkSuffixes(filename).replace(/^\.\.?\//, "");
}

/**
 * Convert absolute path to relative path without leading ./
 */
function getRelativePath(baseDir: string, filePath: string) {
  const relativePath = relative(baseDir, filePath);
  return relativePath.replace(/^\.{1,2}\//, "");
}

/**
 * Check if a node is an import declaration or import expression
 */
function isImport(node: Node): node is ImportDeclaration | ImportExpression {
  return node.type === "ImportDeclaration" || node.type === "ImportExpression";
}

/**
 * Get the import path from an import declaration or import expression
 */
function getImportPath(node: Node) {
  if (!isImport(node)) return;
  if (node.source.type !== "Literal") return;
  if (typeof node.source.value !== "string") return;
  return node.source.value;
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

  const content = await fs.promises.readFile(id, "utf-8");
  const filename = normalizeFilename(getRelativePath(baseDir, id));
  source.files[filename] = content;

  await addFrameworkDependencies(context, id, source);

  const ast = context.parse(content, { jsx: /[jt]sx?$/.test(filename) });
  const imports: string[] = [];

  visit(ast, (node) => {
    const importPath = getImportPath(node);
    if (!importPath) return;
    const normalizedImportPath = normalizeImportPath(importPath);
    imports.push(importPath);
    source.files[filename] = content.replace(importPath, normalizedImportPath);
  });

  for (const importPath of imports) {
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
export function sourcePlugin(): Plugin {
  const queryString = "?source";

  return {
    name: "vite-plugin-source",

    async load(id) {
      if (!id.endsWith(queryString)) return;
      const realId = id.replace(queryString, "");

      const source: Source = {
        files: {},
        dependencies: {},
        devDependencies: {},
      };

      await processFile(this, source, realId);

      return `export default ${JSON.stringify(source, null, 2)}`;
    },
  };
}

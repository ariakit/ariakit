/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, resolve, sep } from "node:path";
import { invariant } from "@ariakit/utils";
import type { LoaderContext } from "astro/loaders";
import type { z } from "astro/zod";
import type { FunctionLikeDeclaration, JSDocTag, SourceFile } from "ts-morph";
import { Node, Project, ts } from "ts-morph";
import { createLogger } from "./logger.ts";
import type { FrameworkSchema, Reference } from "./schemas.ts";
import { ReferenceSchema } from "./schemas.ts";
import { slugify } from "./string.ts";

export interface JsDocFrameworkOptions {
  /** Framework name */
  framework: z.infer<typeof FrameworkSchema>;
  /**
   * Path to the ariakit components package (e.g., `ariakit-react-components`,
   * `ariakit-solid-components`)
   */
  corePath: string;
  /** Path to the ariakit package (e.g., ariakit-react, ariakit-solid) */
  packagePath: string;
  /** Whether to watch for file changes and reload */
  watch?: boolean;
}

interface ComponentCache {
  files: Record<string, number>;
  entryIds: string[];
}

interface FrameworkCache {
  components: Record<string, ComponentCache>;
  sharedFiles?: Record<string, number>;
}

interface ReExportStatement {
  exportList: string;
  fromPath: string;
  typeOnly: boolean;
}

interface GetReExportStatementsOptions {
  includeTypeOnly?: boolean;
}

type ExportedDeclarations = ReturnType<SourceFile["getExportedDeclarations"]>;

interface JsDocInfo {
  description: string;
  liveExamples: string[];
  tags: JSDocTag[];
}

const emptyJsDocInfo: JsDocInfo = {
  description: "",
  liveExamples: [],
  tags: [],
};

const sourceDeclarationsCache = new WeakMap<SourceFile, Map<string, Node[]>>();
const exportedDeclarationsCache = new WeakMap<
  SourceFile,
  ExportedDeclarations
>();
const jsDocInfoCache = new WeakMap<Node, JsDocInfo>();
const typeTextCache = new WeakMap<Node, string>();
const baseInterfacesCache = new WeakMap<Node, Node[]>();
const basePropDeclsCache = new WeakMap<Node, Map<string, Node[]>>();
const propsCache = new WeakMap<Node, Reference["params"]>();
const functionDeclarationCache = new WeakMap<
  Node,
  FunctionLikeDeclaration | null
>();

function getExportedDeclarations(sourceFile: SourceFile) {
  const cached = exportedDeclarationsCache.get(sourceFile);
  if (cached) return cached;
  const declarations = sourceFile.getExportedDeclarations();
  exportedDeclarationsCache.set(sourceFile, declarations);
  return declarations;
}

function addSourceDeclaration(
  declarations: Map<string, Node[]>,
  name: string | undefined,
  node: Node,
) {
  if (!name) return;
  const nodes = declarations.get(name) ?? [];
  nodes.push(node);
  declarations.set(name, nodes);
}

function getSourceDeclarations(sourceFile: SourceFile) {
  const cached = sourceDeclarationsCache.get(sourceFile);
  if (cached) return cached;

  const declarations = new Map<string, Node[]>();
  for (const statement of sourceFile.getStatements()) {
    if (Node.isVariableStatement(statement)) {
      for (const declaration of statement.getDeclarations()) {
        addSourceDeclaration(declarations, declaration.getName(), declaration);
      }
    } else if (
      Node.isFunctionDeclaration(statement) ||
      Node.isInterfaceDeclaration(statement) ||
      Node.isTypeAliasDeclaration(statement) ||
      Node.isClassDeclaration(statement) ||
      Node.isEnumDeclaration(statement)
    ) {
      addSourceDeclaration(declarations, statement.getName(), statement);
    }
  }

  sourceDeclarationsCache.set(sourceFile, declarations);
  return declarations;
}

function getSourceDeclaration(sourceFile: SourceFile, name: string) {
  const declarations = getSourceDeclarations(sourceFile).get(name);
  if (declarations?.length) return declarations;
  return getExportedDeclarations(sourceFile).get(name) ?? [];
}

function getLocalSourceDeclaration(sourceFile: SourceFile, name: string) {
  return getSourceDeclarations(sourceFile).get(name) ?? [];
}

function hasSourceDeclaration(sourceFile: SourceFile, name: string) {
  return getSourceDeclarations(sourceFile).has(name);
}

function getReExportStatements(
  content: string,
  { includeTypeOnly = true }: GetReExportStatementsOptions = {},
) {
  const reExportPattern =
    /export\s*(type\s*)?\{\s*([^}]+)\s*\}\s*from\s*["']([^"']+)["']/g;
  const statements: ReExportStatement[] = [];
  let match: RegExpExecArray | null;

  while ((match = reExportPattern.exec(content)) !== null) {
    const typeOnly = !!match[1];
    if (typeOnly && !includeTypeOnly) continue;

    const exportList = match[2];
    const fromPath = match[3];
    if (!exportList || !fromPath) continue;

    statements.push({ exportList, fromPath, typeOnly });
  }

  return statements;
}

/**
 * Resolves a path without an extension to the first existing `.tsx` or
 * `.ts` variant, returning `undefined` if neither exists.
 */
function resolveExtension(basePath: string): string | undefined {
  if (existsSync(`${basePath}.tsx`)) return `${basePath}.tsx`;
  if (existsSync(`${basePath}.ts`)) return `${basePath}.ts`;
  return undefined;
}

/**
 * Parses a source file for relative imports and returns the resolved
 * absolute paths of those that fall within `boundaryDir`. This captures
 * local helper files (e.g., utils, context) that live inside the same
 * component directory.
 */
function getLocalImports(
  sourceFilePath: string,
  boundaryDir: string,
): string[] {
  if (!existsSync(sourceFilePath)) return [];
  const content = readFileSync(sourceFilePath, "utf-8");
  const dir = dirname(sourceFilePath);
  const paths: string[] = [];

  const importPattern = /from\s+["'](\.\.?\/[^"']+)["']/g;
  let match: RegExpExecArray | null;

  while ((match = importPattern.exec(content)) !== null) {
    const importPath = match[1];
    if (!importPath) continue;
    const resolvedPath = resolve(dir, importPath);
    // Only include files within the component's own directory
    if (!resolvedPath.startsWith(boundaryDir + sep)) continue;
    if (existsSync(resolvedPath)) {
      paths.push(resolvedPath);
    }
  }
  return paths;
}

/**
 * Gets the full set of source file paths that a component module depends
 * on, without creating a ts-morph project. Starts from the public module
 * re-exports and recursively follows local imports within the component
 * directory so that internal helpers (utils, context files, backdrop
 * components, etc.) are included for mtime tracking.
 */
function getComponentSourceFilePaths(
  component: string,
  packagePath: string,
  corePath: string,
  framework: string,
): string[] {
  const publicModulePath = join(packagePath, "src", `${component}.ts`);
  if (!existsSync(publicModulePath)) return [];

  const files = new Set<string>([publicModulePath]);
  const content = readFileSync(publicModulePath, "utf-8");
  const componentDir = join(corePath, "src", component);

  // Seed dependency traversal from public re-exports.
  const queue: string[] = [];

  for (const { fromPath } of getReExportStatements(content)) {
    const finalPath = getCoreSourceFilePath(fromPath, corePath, framework);
    if (finalPath && !files.has(finalPath)) {
      files.add(finalPath);
      queue.push(finalPath);
    }
  }

  // Recursively follow local imports within the component directory so
  // internal helpers, utils, and context files are included.
  while (queue.length > 0) {
    const filePath = queue.shift();
    if (!filePath) break;
    const localImports = getLocalImports(filePath, componentDir);
    for (const importedPath of localImports) {
      if (!files.has(importedPath)) {
        files.add(importedPath);
        queue.push(importedPath);
      }
    }
  }

  return [...files];
}

/**
 * Collects all source files under `{corePath}/src/` that live in shared
 * (non-component) directories such as `utils/`. These files are imported
 * by virtually every component, so any change should trigger a full
 * framework rebuild.
 */
function getSharedSourceFiles(
  corePath: string,
  componentModules: string[],
): string[] {
  const srcDir = join(corePath, "src");
  if (!existsSync(srcDir)) return [];

  const componentSet = new Set(componentModules);
  const files: string[] = [];

  const collectFiles = (dir: string) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        collectFiles(fullPath);
      } else if (entry.isFile()) {
        files.push(fullPath);
      }
    }
  };

  for (const entry of readdirSync(srcDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    // Component directories are tracked separately per component.
    if (componentSet.has(entry.name)) continue;
    collectFiles(join(srcDir, entry.name));
  }

  return files;
}

/**
 * Returns a map of file paths to their modification times in milliseconds.
 */
function getFileMtimes(files: string[]): Record<string, number> {
  const mtimes: Record<string, number> = {};
  for (const file of files) {
    try {
      mtimes[file] = statSync(file).mtimeMs;
    } catch {
      // File no longer exists — will trigger a rebuild
    }
  }
  return mtimes;
}

/**
 * Safely parses a JSON string into a `FrameworkCache`. Returns `null` if
 * the string is falsy, malformed, or doesn't match the expected shape
 * (e.g., after a format change or interrupted write).
 */
function parseFrameworkCache(json: string | undefined): FrameworkCache | null {
  if (!json) return null;
  try {
    const parsed = JSON.parse(json);
    if (typeof parsed !== "object" || parsed === null) return null;
    if (!parsed.components || typeof parsed.components !== "object")
      return null;
    return parsed as FrameworkCache;
  } catch {
    return null;
  }
}

/**
 * Checks whether two mtime maps are identical (same keys and values).
 */
function mtimesEqual(
  a: Record<string, number> | undefined,
  b: Record<string, number> | undefined,
): boolean {
  if (!a || !b) return false;
  const keysA = Object.keys(a);
  const keysB = Object.keys(b);
  if (keysA.length !== keysB.length) return false;
  for (const key of keysA) {
    if (a[key] !== b[key]) return false;
  }
  return true;
}

/**
 * Stores references for a component in the data store and returns the
 * generated entry IDs.
 */
function storeComponentReferences(
  store: LoaderContext["store"],
  references: Reference[],
): string[] {
  const entryIds: string[] = [];
  for (const data of references) {
    const nameSlug = slugify(data.name);
    const id = `${data.framework}/${data.component}/${nameSlug}`;
    store.set({ id, data });
    entryIds.push(id);
  }
  return entryIds;
}

/**
 * Parses a core source file for relative imports to other component
 * directories (e.g., `from "../composite/composite.tsx"`). Returns the
 * resolved absolute paths of those imports.
 */
function getSourceFileImportedPaths(sourceFilePath: string): string[] {
  if (!existsSync(sourceFilePath)) return [];
  const content = readFileSync(sourceFilePath, "utf-8");
  const dir = dirname(sourceFilePath);
  const paths: string[] = [];

  // Only match imports that go up to a sibling component directory
  const importPattern = /from\s+["'](\.\.\/[^"']+)["']/g;
  let match: RegExpExecArray | null;

  while ((match = importPattern.exec(content)) !== null) {
    const importPath = match[1];
    if (!importPath) continue;
    const resolvedPath = resolve(dir, importPath);
    if (existsSync(resolvedPath)) {
      paths.push(resolvedPath);
    }
  }
  return paths;
}

/**
 * Maps an absolute core source file path back to its component name by
 * extracting the first directory segment under `{corePath}/src/`.
 */
function getComponentFromCorePath(
  filePath: string,
  corePath: string,
): string | undefined {
  const srcPrefix = join(corePath, "src") + sep;
  if (!filePath.startsWith(srcPrefix)) return undefined;
  const relativePath = filePath.slice(srcPrefix.length);
  const firstSegment = relativePath.split(sep)[0];
  return firstSegment;
}

/**
 * Builds a component-level dependency graph by scanning cross-component
 * imports in all core source files. Returns a map from each component to
 * the list of other components it imports from.
 */
function buildComponentDependencyGraph(
  componentModules: string[],
  sourceFilesByComponent: Record<string, string[]>,
  corePath: string,
): Record<string, string[]> {
  const componentSet = new Set(componentModules);
  const deps: Record<string, Set<string>> = {};

  for (const comp of componentModules) {
    deps[comp] = new Set();
    const sourceFiles = sourceFilesByComponent[comp] ?? [];
    for (const file of sourceFiles) {
      // Only scan core source files for cross-component imports
      if (!file.startsWith(join(corePath, "src"))) continue;

      const importedPaths = getSourceFileImportedPaths(file);
      for (const importedPath of importedPaths) {
        const depComp = getComponentFromCorePath(importedPath, corePath);
        if (depComp && depComp !== comp && componentSet.has(depComp)) {
          deps[comp].add(depComp);
        }
      }
    }
  }

  const result: Record<string, string[]> = {};
  for (const [comp, depSet] of Object.entries(deps)) {
    result[comp] = [...depSet];
  }
  return result;
}

/**
 * Given a set of directly changed components and a dependency graph,
 * returns all components that need rebuilding — the directly changed ones
 * plus every component that transitively depends on them.
 */
function propagateChanges(
  directlyChanged: Set<string>,
  deps: Record<string, string[]>,
  allComponents: string[],
): Set<string> {
  // Reverse edges so changed dependencies point to their consumers.
  const reverseDeps: Record<string, Set<string>> = {};
  for (const comp of allComponents) {
    reverseDeps[comp] = new Set();
  }
  for (const [comp, compDeps] of Object.entries(deps)) {
    for (const dep of compDeps) {
      reverseDeps[dep]?.add(comp);
    }
  }

  // Traverse consumers transitively from each changed component.
  const affected = new Set(directlyChanged);
  const queue = [...directlyChanged];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;
    const dependents = reverseDeps[current];
    if (!dependents) continue;
    for (const dependent of dependents) {
      if (!affected.has(dependent)) {
        affected.add(dependent);
        queue.push(dependent);
      }
    }
  }

  return affected;
}

/**
 * Creates a JSDoc loader for multiple ariakit framework packages
 */
export function jsdoc(...frameworkOptions: JsDocFrameworkOptions[]) {
  return {
    name: "jsdoc-loader",
    schema: ReferenceSchema,
    async load(context: LoaderContext) {
      const logger = createLogger(context.logger);

      // Lazily create the ts-morph project only when at least one component
      // needs re-parsing.
      let project: Project | undefined;
      const getProject = () => {
        if (!project) {
          project = createProject();
        }
        return project;
      };

      for (const options of frameworkOptions) {
        const { info } = logger.start();
        const { framework, packagePath, corePath } = options;

        const componentModules = getComponentModules(packagePath);

        // Snapshot source files and mtimes for each component.
        const sourceFilesByComponent: Record<string, string[]> = {};
        const currentFileState: Record<string, Record<string, number>> = {};
        for (const comp of componentModules) {
          const files = getComponentSourceFilePaths(
            comp,
            packagePath,
            corePath,
            framework,
          );
          sourceFilesByComponent[comp] = files;
          currentFileState[comp] = getFileMtimes(files);
        }

        // Track shared (non-component) source files like utils/ that are
        // imported by virtually every component. A change in any shared
        // file forces a full framework rebuild.
        const sharedFiles = getSharedSourceFiles(corePath, componentModules);
        const sharedMtimes = getFileMtimes(sharedFiles);

        // Compare the snapshot with the persisted framework cache.
        const cacheKey = `cache:${framework}`;
        const cachedState = parseFrameworkCache(context.meta.get(cacheKey));

        const sharedFilesChanged = !mtimesEqual(
          sharedMtimes,
          cachedState?.sharedFiles,
        );

        const directlyChanged = new Set<string>();
        if (sharedFilesChanged) {
          // Shared files affect all components
          for (const comp of componentModules) {
            directlyChanged.add(comp);
          }
        } else {
          for (const comp of componentModules) {
            const cached = cachedState?.components[comp];
            if (!mtimesEqual(currentFileState[comp], cached?.files)) {
              directlyChanged.add(comp);
            }
          }
        }

        // When the cache is absent (first run, corrupted, or format change),
        // clear all existing store entries for this framework so stale
        // entries from a previous run don't persist.
        if (!cachedState) {
          for (const key of context.store.keys()) {
            if (key.startsWith(`${framework}/`)) {
              context.store.delete(key);
            }
          }
        } else {
          // Find removed components (were cached but no longer in index.ts)
          for (const comp of Object.keys(cachedState.components)) {
            if (componentModules.includes(comp)) continue;
            const cached = cachedState.components[comp];
            if (!cached) continue;
            for (const id of cached.entryIds) {
              context.store.delete(id);
            }
          }
        }

        // Propagate changes through the dependency graph. Components that
        // import types from a changed component (e.g., ComboboxOptions
        // extends CompositeOptions) must also be rebuilt even if their own
        // files haven't changed.
        let changedComponents: Set<string>;
        if (directlyChanged.size === componentModules.length) {
          changedComponents = directlyChanged;
        } else if (directlyChanged.size > 0) {
          const depGraph = buildComponentDependencyGraph(
            componentModules,
            sourceFilesByComponent,
            corePath,
          );
          changedComponents = propagateChanges(
            directlyChanged,
            depGraph,
            componentModules,
          );
        } else {
          changedComponents = directlyChanged;
        }

        if (changedComponents.size === 0) {
          info(`Skipped references for ${framework} (no changes)`);
          continue;
        }

        // Remove stale entries for affected components before reparsing.
        for (const comp of changedComponents) {
          const cached = cachedState?.components[comp];
          if (!cached) continue;
          for (const id of cached.entryIds) {
            context.store.delete(id);
          }
        }

        // Seed the next cache with unchanged components.
        const newCache: FrameworkCache = { components: {} };
        for (const comp of componentModules) {
          if (changedComponents.has(comp)) continue;
          const cached = cachedState?.components[comp];
          if (!cached) continue;
          newCache.components[comp] = cached;
        }

        // Reparse affected components and record their mtimes and entry IDs.
        let totalReferences = 0;
        const project = getProject();
        prepareProjectSourceFiles({
          project,
          components: changedComponents,
          packagePath,
          corePath,
          framework,
        });

        for (const comp of changedComponents) {
          const references = parseComponentReferences({
            project,
            component: comp,
            packagePath,
            corePath,
            framework,
          });

          const entryIds = storeComponentReferences(context.store, references);

          const fileMtimes = currentFileState[comp];
          if (fileMtimes) {
            newCache.components[comp] = { files: fileMtimes, entryIds };
          }
          totalReferences += references.length;
        }

        // Persist the completed cache for the next load.
        newCache.sharedFiles = sharedMtimes;
        context.meta.set(cacheKey, JSON.stringify(newCache));

        const changedCount = changedComponents.size;
        if (changedCount === componentModules.length) {
          info(`Loaded ${totalReferences} references for ${framework}`);
        } else {
          const propagatedCount = changedCount - directlyChanged.size;
          const parts = [`${directlyChanged.size} directly changed`];
          if (propagatedCount > 0) {
            parts.push(`${propagatedCount} via dependencies`);
          }
          info(
            `Loaded ${totalReferences} references for ` +
              `${changedCount}/${componentModules.length} components ` +
              `in ${framework} (${parts.join(", ")})`,
          );
        }
      }

      if (!context.watcher) return;

      // Register package and core roots for watch-enabled frameworks.
      const watchedPaths = new Set<string>();

      for (const options of frameworkOptions) {
        if (!options.watch) continue;
        watchedPaths.add(options.packagePath);
        watchedPaths.add(options.corePath);
        context.watcher.add(options.packagePath);
        context.watcher.add(options.corePath);
      }

      if (!watchedPaths.size) return;

      // In watch mode, reload all references for the affected framework.
      // This keeps the watcher simple while still updating the cache for
      // subsequent cold starts.
      context.watcher.on("all", (_, path) => {
        const options = frameworkOptions.find(({ corePath, packagePath }) =>
          [corePath, packagePath].some(
            (p) => path.startsWith(p + sep) || path === p,
          ),
        );
        if (!options) return;

        const { info } = logger.start();
        const { framework, packagePath, corePath } = options;

        // Replace cached store entries for the affected framework.
        const cacheKey = `cache:${framework}`;
        const cachedState = parseFrameworkCache(context.meta.get(cacheKey));
        if (cachedState) {
          for (const comp of Object.values(cachedState.components)) {
            for (const id of comp.entryIds) {
              context.store.delete(id);
            }
          }
        }

        const references = loadReferences({
          packagePath,
          corePath,
          framework,
        });

        // Rebuild component mtimes and entry IDs for future cold starts.
        const componentModules = getComponentModules(packagePath);
        const newCache: FrameworkCache = { components: {} };
        const referencesByComponent = new Map<string, Reference[]>();

        for (const data of references) {
          const componentReferences =
            referencesByComponent.get(data.component) ?? [];
          componentReferences.push(data);
          referencesByComponent.set(data.component, componentReferences);
        }

        for (const comp of componentModules) {
          const entryIds = storeComponentReferences(
            context.store,
            referencesByComponent.get(comp) ?? [],
          );
          const files = getComponentSourceFilePaths(
            comp,
            packagePath,
            corePath,
            framework,
          );
          newCache.components[comp] = {
            files: getFileMtimes(files),
            entryIds,
          };
        }

        const sharedFiles = getSharedSourceFiles(corePath, componentModules);
        newCache.sharedFiles = getFileMtimes(sharedFiles);
        context.meta.set(cacheKey, JSON.stringify(newCache));
        info(`Loaded ${references.length} references for ${framework}`);
      });
    },
  };
}

/**
 * Creates a ts-morph project for parsing TypeScript files
 */
function createProject() {
  return new Project({
    tsConfigFilePath: resolve(
      import.meta.dirname,
      "../../../tsconfig.base.json",
    ),
    skipAddingFilesFromTsConfig: true,
  });
}

function getCoreSourceFilePath(
  fromPath: string,
  corePath: string,
  framework: string,
) {
  const corePackagePrefix = `@ariakit/${framework}-components/`;
  const sourcePath = fromPath.startsWith(corePackagePrefix)
    ? fromPath.slice(corePackagePrefix.length)
    : fromPath;
  const resolvedPath = join(corePath, "src", sourcePath);
  return resolveExtension(resolvedPath);
}

function addProjectSourceFile(project: Project, filePath: string) {
  const sourceFile = project.getSourceFile(filePath);
  if (sourceFile) return false;
  project.addSourceFileAtPath(filePath);
  return true;
}

interface PrepareProjectSourceFilesParams {
  project: Project;
  components: Iterable<string>;
  packagePath: string;
  corePath: string;
  framework: z.infer<typeof FrameworkSchema>;
}

function prepareProjectSourceFiles({
  project,
  components,
  packagePath,
  corePath,
  framework,
}: PrepareProjectSourceFilesParams) {
  let added = false;

  for (const component of components) {
    const publicModulePath = join(packagePath, "src", `${component}.ts`);
    if (!existsSync(publicModulePath)) continue;

    const content = readFileSync(publicModulePath, "utf-8");
    const statements = getReExportStatements(content, {
      includeTypeOnly: false,
    });

    for (const { fromPath } of statements) {
      const finalPath = getCoreSourceFilePath(fromPath, corePath, framework);
      if (!finalPath) continue;
      added = addProjectSourceFile(project, finalPath) || added;
    }
  }

  if (added) {
    project.resolveSourceFileDependencies();
  }
}

/**
 * Determines the kind of export based on name patterns and type information
 * Returns null for types that should be skipped
 */
function getExportKind(name: string, node: Node) {
  if (Node.isInterfaceDeclaration(node) || Node.isTypeAliasDeclaration(node)) {
    return null;
  }
  if (name.startsWith("use") && name.endsWith("Store")) {
    return "store";
  }
  // Classify components before functions because component exports are
  // callable.
  const sourceFile = node.getSourceFile();
  const hasComponentOptions =
    hasSourceDeclaration(sourceFile, `${name}Options`) ||
    hasSourceDeclaration(sourceFile, `${name}Props`);
  if (hasComponentOptions) {
    return "component";
  }
  if (
    name.startsWith("use") ||
    Node.isFunctionLikeDeclaration(node) ||
    getFunctionDeclaration(node)
  ) {
    return "function";
  }
  return null;
}

/**
 * Extracts live examples from description text and returns cleaned description
 */
function extractLiveExamples(text: string) {
  if (!text) return { description: "", liveExamples: [] };
  // Preserve paragraph breaks while joining wrapped live-example lines.
  const normalizedText = text.replace(/(?<!\n)\n(?!\n)/g, " ");
  // Match the normalized "Live examples:" Markdown list.
  const liveExamplesMatch = normalizedText.match(
    /Live examples:\s*((?:\s*-\s*\[.*?\]\(.*?\).*?)+)/i,
  );
  if (!liveExamplesMatch) {
    return { description: text.trim(), liveExamples: [] };
  }
  const liveExamplesSection = liveExamplesMatch[1];
  if (!liveExamplesSection) {
    return { description: text.trim(), liveExamples: [] };
  }
  const urlMatches = liveExamplesSection.match(/\[.*?\]\((.*?)\)/g) || [];
  const liveExamples = urlMatches
    .map((match) => {
      const urlMatch = match.match(/\[.*?\]\((.*?)\)/);
      return urlMatch?.[1];
    })
    .filter((url): url is string => !!url);
  const cleanedDescription = text.replace(/\s*Live examples:.*$/is, "").trim();

  return { description: cleanedDescription, liveExamples };
}

function getJsDocInfo(node: Node): JsDocInfo {
  const cached = jsDocInfoCache.get(node);
  if (cached) return cached;
  if (!Node.isJSDocable(node)) return emptyJsDocInfo;

  const jsDocs = node.getJsDocs();
  if (!jsDocs.length) return emptyJsDocInfo;

  const firstJsDoc = jsDocs[0];
  const rawDescription = firstJsDoc?.getDescription() || "";
  const { description, liveExamples } = extractLiveExamples(rawDescription);
  const tags: JSDocTag[] = [];

  for (const jsDoc of jsDocs) {
    tags.push(...jsDoc.getTags());
  }

  const info = { description, liveExamples, tags };
  jsDocInfoCache.set(node, info);
  return info;
}

/**
 * Extracts description and live examples from JSDoc comments
 */
function getDescriptionAndLiveExamples(node: Node): {
  description: string;
  liveExamples: string[];
} {
  const { description, liveExamples } = getJsDocInfo(node);
  return { description, liveExamples };
}

/**
 * Extracts JSDoc tags from a node
 */
function getTags(node: Node) {
  return getJsDocInfo(node).tags;
}

/**
 * Checks if a node has @private tag
 */
function isPrivate(node: Node) {
  const tags = getTags(node);
  return tags.some((tag) => tag.getTagName() === "private");
}

/**
 * Gets (at)deprecated tag information
 */
function getDeprecated(node: Node) {
  const tags = getTags(node);
  const tag = tags.find((tag) => tag.getTagName() === "deprecated");
  if (!tag) return false;
  const comment = tag.getCommentText();
  return comment ? comment : true;
}

/**
 * Gets (at)default tag value
 */
function getDefaultValue(node: Node) {
  const tags = getTags(node);
  const tag = tags.find((tag) => tag.getTagName() === "default");
  const comment = tag?.getCommentText();
  if (!comment) return;
  return comment.trim();
}

/**
 * Extracts (at)example blocks from JSDoc
 */
function getExamples(node: Node) {
  const tags = getTags(node);
  const examples: Reference["examples"] = [];

  for (const tag of tags) {
    if (tag.getTagName() !== "example") continue;
    const text = tag.getCommentText();
    if (!text) continue;
    // Parse an optional description followed by a fenced code block.
    const match = text.match(
      /^(?<description>(.|\n)*)```(?<language>\S+)(?<modifiers>[^\n]*)\n(?<code>(.|\n)+)\n```$/m,
    );
    examples.push({
      description: (match?.groups?.description || "").trim(),
      language: match?.groups?.language || "jsx",
      meta: match?.groups?.modifiers?.trim() || "",
      code: (match?.groups?.code || text).trim(),
    });
  }
  return examples;
}

/**
 * Gets type information from a TypeScript node
 */
function getTypeText(node: Node) {
  const cached = typeTextCache.get(node);
  if (cached !== undefined) return cached;
  const type = node
    .getType()
    .getText(
      undefined,
      ts.TypeFormatFlags.UseAliasDefinedOutsideCurrentScope |
        ts.TypeFormatFlags.AddUndefined |
        ts.TypeFormatFlags.UseFullyQualifiedType,
    );
  typeTextCache.set(node, type);
  return type;
}

/**
 * Gets all direct base interface declarations for a given interface declaration
 */
function getBaseInterfaces(iface: Node) {
  const cached = baseInterfacesCache.get(iface);
  if (cached) return cached;
  const bases: Node[] = [];
  if (!Node.isInterfaceDeclaration(iface)) {
    return bases;
  }
  const extendsList = iface.getExtends();
  for (const ext of extendsList) {
    const type = ext.getType();
    const symbol = type.getSymbol();
    const decls = symbol?.getDeclarations() || [];
    for (const d of decls) {
      if (!Node.isInterfaceDeclaration(d)) continue;
      bases.push(d);
    }
  }
  baseInterfacesCache.set(iface, bases);
  return bases;
}

/**
 * Finds property declarations for a given prop name across base interfaces
 * of the provided owner interface, in nearest-first order.
 */
function findPropDeclsInBaseHierarchy(owner: Node, propName: string) {
  const cachedByName = basePropDeclsCache.get(owner);
  const cached = cachedByName?.get(propName);
  if (cached) return cached;

  const results: Node[] = [];
  if (!Node.isInterfaceDeclaration(owner)) {
    return results;
  }
  const visited = new Set<Node>();
  const queue = [...getBaseInterfaces(owner)];
  while (queue.length) {
    const current = queue.shift();
    if (!current) break;
    if (visited.has(current)) continue;
    visited.add(current);
    const type = current.getType();
    const sym = type.getProperty(propName);
    const decl = sym?.getDeclarations()?.[0];
    if (decl) {
      results.push(decl);
    }
    const bases = getBaseInterfaces(current);
    for (const base of bases) {
      queue.push(base);
    }
  }
  const nextCachedByName = cachedByName ?? new Map<string, Node[]>();
  nextCachedByName.set(propName, results);
  basePropDeclsCache.set(owner, nextCachedByName);
  return results;
}

/**
 * Extracts props from a type or interface
 */
function getProps(node: Node) {
  const cached = propsCache.get(node);
  if (cached) return cached;

  const nodeProps = node.getType().getProperties();
  const props: Reference["params"] = [];
  // Cache before descending so recursive object types don't recurse forever.
  propsCache.set(node, props);

  for (const prop of nodeProps) {
    const decl = prop.getDeclarations().at(0);
    if (!decl) continue;
    // Skip only if all candidates are private later; start from local decl
    const propName = Node.isPropertySignature(decl)
      ? decl.getName() || prop.getEscapedName()
      : prop.getEscapedName();

    // Search the local declaration before inherited versions.
    const decls = [decl];
    decls.push(...findPropDeclsInBaseHierarchy(node, propName));

    // Use description and live examples from the nearest visible declaration.
    let description = "";
    let liveExamples: string[] = [];
    for (const decl of decls) {
      const res = getDescriptionAndLiveExamples(decl);
      if (!res.description) continue;
      description = res.description;
      liveExamples = res.liveExamples;
      break;
    }
    if (!description) continue;

    const primaryDecl = decls[0];
    if (!primaryDecl) continue;
    const type = getTypeText(primaryDecl);

    // Treat tags as a unit: the nearest visible tagged declaration overrides
    // all base tags.
    const localHasTags = !!getTags(primaryDecl).length;
    const tagsDecl = localHasTags
      ? primaryDecl
      : decls.slice(1).find((d) => !!getTags(d).length);

    const hasPrivateTag = tagsDecl ? isPrivate(tagsDecl) : false;
    if (hasPrivateTag) continue;

    const deprecated = tagsDecl ? getDeprecated(tagsDecl) : false;
    const defaultValue = tagsDecl ? getDefaultValue(tagsDecl) : undefined;
    const examples = tagsDecl ? getExamples(tagsDecl) : [];

    const nestedProps = getProps(primaryDecl);
    props.push({
      name: prop.getEscapedName(),
      type,
      description,
      optional: prop.isOptional() || type.endsWith(" | undefined"),
      defaultValue,
      deprecated,
      examples,
      liveExamples,
      props: nestedProps.length > 0 ? nestedProps : undefined,
    });
  }

  return props.sort((a, b) => {
    if (a.deprecated && !b.deprecated) return 1;
    if (!a.deprecated && b.deprecated) return -1;
    return a.name.localeCompare(b.name);
  });
}

/**
 * Gets the function declaration from a node (for functions and components)
 */
function getFunctionDeclaration(
  node: Node,
): FunctionLikeDeclaration | undefined {
  const cached = functionDeclarationCache.get(node);
  if (cached !== undefined) return cached ?? undefined;
  if (Node.isFunctionLikeDeclaration(node)) return node;
  const declaration = node.getFirstDescendant((node) =>
    Node.isFunctionLikeDeclaration(node),
  );
  functionDeclarationCache.set(node, declaration ?? null);
  return declaration;
}

/**
 * Gets parameters from a function declaration
 */
function getFunctionParams(
  fn: FunctionLikeDeclaration,
  includeUndocumented = false,
) {
  const params: Reference["params"] = [];
  const parameters = fn.getParameters();

  for (const param of parameters) {
    const { description, liveExamples } = getDescriptionAndLiveExamples(param);
    // Skip undocumented params only for regular functions, not for
    // stores/components
    if (!description && !includeUndocumented) continue;
    const type = getTypeText(param);
    const deprecated = getDeprecated(param);
    const defaultValue = getDefaultValue(param);
    const examples = getExamples(param);
    const nestedProps = getProps(param);
    const nameNode = param.getNameNode();
    const paramName = Node.isIdentifier(nameNode)
      ? nameNode.getText()
      : param.getName();
    params.push({
      name: paramName,
      type,
      description: description || "",
      optional: param.isOptional() || param.hasQuestionToken(),
      defaultValue,
      deprecated,
      examples,
      liveExamples,
      props: nestedProps.length > 0 ? nestedProps : undefined,
    });
  }

  return params;
}

/**
 * Gets state properties for store kinds from XStoreState type
 */
function getStoreState(name: string, node: Node) {
  if (!name.endsWith("Store")) return [];
  const stateTypeName = name
    .replace(/^use/, "")
    .replace(/Store$/, "StoreState");
  const sourceFile = node.getSourceFile();
  const stateDecl = getLocalSourceDeclaration(sourceFile, stateTypeName).at(0);
  if (!stateDecl) return [];
  return getProps(stateDecl);
}

/**
 * Gets return value information for functions and stores
 */
function getReturnValue(
  fn: FunctionLikeDeclaration,
  kind: Reference["kind"],
): Reference["returnValue"] {
  const returnTypeNode = fn.getReturnTypeNode();
  if (!returnTypeNode) return undefined;
  const type = getTypeText(returnTypeNode);
  const props = kind === "store" ? getProps(returnTypeNode) : [];
  return {
    type,
    description: "",
    props: props.length > 0 ? props : undefined,
  };
}

/**
 * Checks if a function has overloads and returns the implementation
 */
function getFinalFunctionImplementation(node: Node) {
  const name = getSymbolName(node);
  const sourceFile = node.getSourceFile();
  const declarations = getSourceDeclaration(sourceFile, name);

  const implementations: FunctionLikeDeclaration[] = [];
  for (const decl of declarations) {
    if (Node.isFunctionLikeDeclaration(decl)) {
      // Function declarations without bodies are overload signatures.
      if (Node.isFunctionDeclaration(decl) && decl.getBody()) {
        implementations.push(decl);
      } else if (!Node.isFunctionDeclaration(decl)) {
        implementations.push(decl);
      }
    }
  }

  return implementations.at(-1);
}

/**
 * Extracts the symbol name from various node types
 */
function getSymbolName(node: Node): string {
  if (Node.isVariableStatement(node)) {
    const [decl] = node.getDeclarations();
    invariant(decl, "Variable statement must have a declaration");
    return decl.getName();
  }
  return node.getSymbolOrThrow().getName();
}

interface CreateReferenceParams {
  node: Node;
  component: string;
  framework: z.infer<typeof FrameworkSchema>;
  propsNode?: Node;
}

/**
 * Creates a Reference object from a TypeScript node
 */
function createReference({
  node,
  component,
  framework,
  propsNode,
}: CreateReferenceParams): Reference {
  const name = getSymbolName(node);
  // For variable declarations, get the parent statement for JSDoc
  const docNode = Node.isVariableDeclaration(node)
    ? node.getVariableStatementOrThrow()
    : node;
  const kind = getExportKind(name, node);
  if (kind === null) {
    throw new Error(`Unexpected null kind for ${name}`);
  }
  const fn =
    getFinalFunctionImplementation(node) || getFunctionDeclaration(docNode);

  let params: Reference["params"] = [];
  let state: Reference["state"] = [];
  let returnValue: Reference["returnValue"];

  if (kind === "component") {
    // Represent ComponentNameOptions/Props as the component's props parameter.
    const sourceFile = node.getSourceFile();
    const optionsDecl =
      propsNode ||
      getLocalSourceDeclaration(sourceFile, `${name}Options`).at(0) ||
      getLocalSourceDeclaration(sourceFile, `${name}Props`).at(0) ||
      fn?.getParameters()?.at(0);

    if (optionsDecl) {
      const optionsProps = getProps(optionsDecl);
      const { description: propsDescription, liveExamples: propsLiveExamples } =
        getDescriptionAndLiveExamples(optionsDecl);
      params = [
        {
          name: "props",
          type: getTypeText(optionsDecl),
          description: propsDescription || `${name} component props`,
          optional: false,
          defaultValue: undefined,
          deprecated: false,
          examples: [],
          liveExamples: propsLiveExamples,
          props: optionsProps.length > 0 ? optionsProps : undefined,
        },
      ];
    }
  } else if (kind === "function") {
    if (fn) {
      params = getFunctionParams(fn);
      returnValue = getReturnValue(fn, kind);
    }
  } else if (kind === "store") {
    // Store hooks expose undocumented parameters and their StoreState shape.
    if (fn) {
      params = getFunctionParams(fn, true);
      returnValue = getReturnValue(fn, kind);
    }
    state = getStoreState(name, node);
  }
  // Extract serializable reference data after kind-specific analysis.
  const { description, liveExamples } = getDescriptionAndLiveExamples(docNode);
  const deprecated = getDeprecated(docNode);
  const examples = getExamples(docNode);
  return {
    name,
    component,
    kind,
    framework,
    description,
    deprecated,
    examples,
    params,
    state,
    returnValue,
    liveExamples,
  };
}

interface GetPublicExportsParams {
  component: string;
  packagePath: string;
}

/**
 * Gets the exported names from an ariakit package module file
 */
function getPublicExports({
  component,
  packagePath,
}: GetPublicExportsParams): Set<string> {
  const publicModulePath = join(packagePath, "src", `${component}.ts`);
  if (!existsSync(publicModulePath)) {
    return new Set();
  }
  const content = readFileSync(publicModulePath, "utf-8");
  const exports = new Set<string>();
  // Match the export forms used by package entry modules.
  const patterns = [
    // export { Name } from "path"
    /export\s*{\s*([^}]+)\s*}\s*from/g,
    // export { Name }
    /export\s*{\s*([^}]+)\s*}/g,
    // export const Name = ...
    /export\s+const\s+(\w+)/g,
    // export function Name
    /export\s+function\s+(\w+)/g,
    // export type { Name } from "path"
    /export\s+type\s*{\s*([^}]+)\s*}\s*from/g,
  ];
  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(content)) !== null) {
      const exportList = match[1];
      if (!exportList) continue;
      // Split brace lists and keep the local name before any export alias.
      const names = exportList
        .split(",")
        .map((name) => name.trim().replace(/\s+as\s+\w+/, ""));
      names.forEach((name) => {
        if (name) {
          exports.add(name.trim());
        }
      });
    }
  }
  return exports;
}

interface ParseModuleReferencesParams {
  project: Project;
  component: string;
  publicExports: Set<string>;
  packagePath: string;
  corePath: string;
  framework: z.infer<typeof FrameworkSchema>;
}

/**
 * Parses public module re-export statements into component references.
 */
function parseModuleReferences({
  project,
  component,
  publicExports,
  packagePath,
  corePath,
  framework,
}: ParseModuleReferencesParams) {
  const publicModulePath = join(packagePath, "src", `${component}.ts`);
  const content = readFileSync(publicModulePath, "utf-8");
  const references: Reference[] = [];

  // Type-only re-exports don't create reference entries.
  const statements = getReExportStatements(content, { includeTypeOnly: false });
  for (const { exportList, fromPath } of statements) {
    const sourceReferences = parseSourceFileExports({
      project,
      component,
      fromPath,
      exportList,
      publicExports,
      corePath,
      framework,
    });
    references.push(...sourceReferences);
  }

  return references.sort((a, b) => {
    const order = { function: 0, store: 1, component: 2 };
    const aOrder = order[a.kind];
    const bOrder = order[b.kind];

    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.name.localeCompare(b.name);
  });
}

interface ParseSourceFileExportsParams {
  project: Project;
  component: string;
  fromPath: string;
  exportList: string;
  publicExports: Set<string>;
  corePath: string;
  framework: z.infer<typeof FrameworkSchema>;
}

/**
 * Parses exports from a specific source file
 */
function parseSourceFileExports({
  project,
  component,
  fromPath,
  exportList,
  publicExports,
  corePath,
  framework,
}: ParseSourceFileExportsParams) {
  const finalPath = getCoreSourceFilePath(fromPath, corePath, framework);
  if (!finalPath) return [];

  let sourceFile = project.getSourceFile(finalPath);
  if (!sourceFile) {
    sourceFile = project.addSourceFileAtPath(finalPath);
  }

  const references: Reference[] = [];
  const processedNames = new Set<string>();

  // Normalize the re-export list before resolving declarations.
  const names = exportList
    .split(",")
    .map((name) => name.trim().replace(/\s+as\s+\w+/, ""))
    .filter((name) => name);

  for (const name of names) {
    if (!publicExports.has(name)) continue;

    if (processedNames.has(name)) continue;
    processedNames.add(name);

    const decl = getSourceDeclaration(sourceFile, name).at(0);
    if (!decl) continue;

    if (isPrivate(decl)) continue;

    const kind = getExportKind(name, decl);

    if (kind !== null) {
      const optionsType = getLocalSourceDeclaration(
        sourceFile,
        `${name}Options`,
      ).at(0);

      references.push(
        createReference({
          node: decl,
          component,
          framework,
          propsNode: optionsType,
        }),
      );
    }
  }

  return references;
}

interface ParseComponentReferencesParams {
  project: Project;
  component: string;
  packagePath: string;
  corePath: string;
  framework: z.infer<typeof FrameworkSchema>;
}

/**
 * Parses references from a single component module
 */
function parseComponentReferences({
  project,
  component,
  packagePath,
  corePath,
  framework,
}: ParseComponentReferencesParams) {
  const publicExports = getPublicExports({ component, packagePath });
  if (publicExports.size === 0) {
    console.warn(`No public exports found for component: ${component}`);
    return [];
  }
  return parseModuleReferences({
    project,
    component,
    publicExports,
    packagePath,
    corePath,
    framework,
  });
}

/**
 * Gets all component module names from ariakit package index.ts
 */
function getComponentModules(packagePath: string) {
  const indexPath = join(packagePath, "src", "index.ts");
  const content = readFileSync(indexPath, "utf-8");
  const modules: string[] = [];
  const exportRegex = /export \* from ["']\.\/(.+?)["'];/g;
  let match: RegExpExecArray | null;

  while ((match = exportRegex.exec(content)) !== null) {
    const moduleName = match[1];
    if (moduleName) {
      modules.push(moduleName.replace(/\.ts$/, ""));
    }
  }

  return modules;
}

interface LoadReferencesParams {
  packagePath: string;
  corePath: string;
  framework: z.infer<typeof FrameworkSchema>;
}

/**
 * Main loader function that parses all references
 */
function loadReferences({
  packagePath,
  corePath,
  framework,
}: LoadReferencesParams) {
  const project = createProject();
  const componentModules = getComponentModules(packagePath);
  const allReferences: Reference[] = [];
  prepareProjectSourceFiles({
    project,
    components: componentModules,
    packagePath,
    corePath,
    framework,
  });

  for (const component of componentModules) {
    const references = parseComponentReferences({
      project,
      component,
      packagePath,
      corePath,
      framework,
    });
    allReferences.push(...references);
  }

  return allReferences;
}

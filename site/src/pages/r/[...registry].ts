import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";
import { basename, dirname, extname, join } from "node:path";
import type { APIRoute } from "astro";
import type { Registry, RegistryItem } from "shadcn/schema";
import { z } from "zod/v4";
import {
  getFrameworkByFilename,
  isFrameworkDependency,
  removeFrameworkSuffix,
} from "#app/lib/frameworks.ts";
import { createLogger } from "#app/lib/logger.ts";
import { nonNullable } from "#app/lib/object.ts";
import { badRequest, notFound } from "#app/lib/response.ts";
import type { Source, SourceFile } from "#app/lib/source.ts";
import { getImportPaths, replaceImportPaths } from "#app/lib/source.ts";
import type { ModuleJson } from "#app/lib/styles.ts";
import { resolveDirectStyles, styleDefsToCss } from "#app/lib/styles.ts";
import stylesJson from "#app/styles/styles.json" with { type: "json" };

// =============================================================================
// Constants
// =============================================================================

const logger = createLogger("registry");

export const prerender = false;

const previewImports = import.meta.glob("../../examples/**/preview.astro");

const SRC_DIR_TOKEN = "/src/";
const EXAMPLES_PREFIX = "examples/";
const LIB_PREFIX = "examples/_lib/";
const DATA_PREFIX = "examples/_lib/data/";
const REACT_UTILS_PREFIX = "examples/_lib/react-utils/";
const REACT_HOOKS_PREFIX = "examples/_lib/react-hooks/";

const THEME_CSS = {
  '@import "@ariakit/tailwind"': {},
  body: {
    "@apply ak-layer-canvas": {},
  },
};

const THEME_CSS_VARS = {
  "--color-canvas": "var(--color-canvas)",
  "--color-primary": "var(--color-primary)",
  "--color-secondary": "var(--color-secondary)",
  "--radius-container": "var(--radius-xl)",
  "--spacing-container": "--spacing(1)",
  "--radius-tooltip": "var(--radius-lg)",
  "--spacing-tooltip": "--spacing(1)",
  "--radius-dialog": "var(--radius-2xl)",
  "--spacing-dialog": "--spacing(4)",
  "--radius-field": "var(--radius-lg)",
  "--spacing-field": "0.75em",
  "--radius-card": "var(--radius-xl)",
  "--spacing-card": "--spacing(4)",
  "--radius-badge": "var(--radius-full)",
  "--spacing-badge": "--spacing(1.5)",
};

const THEME_CSS_VARS_LIGHT = {
  "--canvas": "oklch(99.33% 0.0011 197.14)",
  "--primary": "oklch(56.7% 0.154556 248.5156)",
  "--secondary": "oklch(65.59% 0.2118 354.31)",
};

const THEME_CSS_VARS_DARK = {
  "--canvas": "oklch(16.34% 0.0091 264.28)",
  "--primary": "oklch(56.7% 0.154556 248.5156)",
  "--secondary": "oklch(65.59% 0.2118 354.31)",
};

const queryParamsSchema = z.object({
  ariakit: z.stringbool().default(true),
});

// =============================================================================
// Types
// =============================================================================

type RegistryItemFile = NonNullable<RegistryItem["files"]>[number];

type RegistrySource = Source | SourceFile | ModuleJson;

interface GetRegistryItemParams {
  source: RegistrySource;
  url: URL;
  /** Whether to omit file content (for the index listing). */
  index?: boolean;
}

// =============================================================================
// Path Utilities
// =============================================================================

/** Normalizes path separators to forward slashes. */
function normalizePath(value: string) {
  return value.replace(/\\/g, "/");
}

/**
 * Extracts the path relative to the src directory.
 * @example
 * getRelativePathFromSrc("/project/src/examples/foo.ts") // "examples/foo.ts"
 * getRelativePathFromSrc("src/examples/foo.ts") // "examples/foo.ts"
 */
function getRelativePathFromSrc(value: string) {
  const normalized = normalizePath(value);
  const srcIndex = normalized.lastIndexOf(SRC_DIR_TOKEN);
  if (srcIndex >= 0) {
    return normalized.slice(srcIndex + SRC_DIR_TOKEN.length);
  }
  if (normalized.startsWith("src/")) {
    return normalized.slice("src/".length);
  }
  if (normalized.startsWith("/src/")) {
    return normalized.slice(SRC_DIR_TOKEN.length);
  }
  return normalized.replace(/^(\.?\/)+/, "");
}

/**
 * Resolves an import path to an absolute path relative to the source file.
 * Handles relative imports and #app/ alias imports.
 */
function resolveImportAbsolutePath(fromPath: string, importPath: string) {
  if (importPath.startsWith(".")) {
    return normalizePath(join(dirname(fromPath), importPath));
  }
  if (importPath.startsWith("#app/")) {
    return normalizePath(`src/${importPath.slice("#app/".length)}`);
  }
  return importPath;
}

/**
 * Checks if a path belongs to the shared library (examples/_lib) but not data.
 */
function isLibrarySourcePath(sourcePath: string) {
  const relativePath = getRelativePathFromSrc(sourcePath);
  return (
    relativePath.startsWith(LIB_PREFIX) && !relativePath.startsWith(DATA_PREFIX)
  );
}

// =============================================================================
// Registry Item Name/Type/Path Derivation
// =============================================================================

/**
 * Extracts the filename without framework suffix.
 * @example getRegistryItemFilename("button.react.tsx") // "button.tsx"
 */
function getRegistryItemFilename(sourcePath: string) {
  const normalizedPath = normalizePath(sourcePath);
  return removeFrameworkSuffix(basename(normalizedPath));
}

/**
 * Derives the example folder name from a source path.
 * @example getExamplesFolderName("examples/disclosure/index.tsx") // "disclosure"
 */
function getExamplesFolderName(sourcePath: string) {
  const relativeDir = getRelativePathFromSrc(dirname(sourcePath));
  const withoutPrefix = relativeDir.startsWith(EXAMPLES_PREFIX)
    ? relativeDir.slice(EXAMPLES_PREFIX.length)
    : relativeDir;
  return withoutPrefix.replace("/", "-").replace("-_component", "");
}

/**
 * Generates the unique registry item name from a source path.
 * @example
 * getRegistryItemName("examples/_lib/react/button.tsx") // "react-button"
 * getRegistryItemName("examples/disclosure/index.react.tsx")
 *   // "react-examples-disclosure"
 */
function getRegistryItemName(sourcePath: string) {
  const relativePath = getRelativePathFromSrc(sourcePath);

  if (relativePath.endsWith(".css")) {
    return `ak-${basename(relativePath, ".css").replace(/^ak-/, "")}`;
  }

  const isLibrary = isLibrarySourcePath(relativePath);
  const isComponent = relativePath.includes("/_component");

  const prefix = isLibrary
    ? basename(dirname(relativePath))
    : `${isComponent ? "components" : "examples"}-${getExamplesFolderName(relativePath)}`;

  const filename = getRegistryItemFilename(relativePath);
  const filenameNoExt = basename(filename, extname(filename));
  const framework = getFrameworkByFilename(relativePath);

  if (!framework) {
    return `${prefix}-${filenameNoExt}`.replace(/-index$/, "");
  }

  const name = prefix.startsWith(framework)
    ? `${prefix}-${filenameNoExt}`
    : `${framework}-${prefix}-${filenameNoExt}`;

  return name.replace(/-index$/, "");
}

// Subset of registry item types that we actually use
type RegistryItemType =
  | "registry:ui"
  | "registry:lib"
  | "registry:hook"
  | "registry:example";

/**
 * Determines the shadcn registry item type from a source path.
 */
function getRegistryItemType(sourcePath: string): RegistryItemType {
  const relativePath = getRelativePathFromSrc(sourcePath);
  if (relativePath.endsWith(".css")) return "registry:ui";
  if (relativePath.startsWith(REACT_UTILS_PREFIX)) return "registry:lib";
  if (relativePath.startsWith(REACT_HOOKS_PREFIX)) return "registry:hook";
  if (relativePath.startsWith(DATA_PREFIX)) return "registry:example";
  if (relativePath.startsWith(LIB_PREFIX)) return "registry:ui";
  if (relativePath.startsWith(EXAMPLES_PREFIX)) return "registry:example";
  return "registry:ui";
}

/**
 * Generates the output path for a registry item file.
 */
function getRegistryItemPath(sourcePath: string) {
  const type = getRegistryItemType(sourcePath);
  const filename = getRegistryItemFilename(sourcePath);
  if (type === "registry:lib") return `registry/lib/${filename}`;
  if (type === "registry:hook") return `registry/hook/${filename}`;
  if (type === "registry:ui") {
    return `registry/ui/${filename.replace("ak-", "")}`;
  }
  const folderName = getExamplesFolderName(sourcePath);
  return `registry/examples/${folderName}/${filename}`;
}

// =============================================================================
// Source Utilities
// =============================================================================

/**
 * Extracts a flat map of source files from any registry source type.
 */
function getFlattenedSources(
  source: RegistrySource,
): Record<string, SourceFile> {
  if ("sources" in source) {
    return source.sources;
  }
  if ("id" in source && !("utilities" in source)) {
    return { [source.id]: source as SourceFile };
  }
  return {};
}

/**
 * Checks if the given target belongs to a different registry item than source.
 */
function isExternalRegistryItem(source: RegistrySource, targetId: string) {
  if ("name" in source) {
    return source.name !== getRegistryItemName(targetId);
  }
  if ("id" in source) {
    return source.id !== targetId;
  }
  return false;
}

/**
 * Filters out library sources, keeping only non-library external sources.
 * If all sources would be filtered out, returns the original sources unchanged.
 *
 * This is used to separate the item's own files from library dependencies:
 * - Library files become registryDependencies
 * - Non-library files are included in the item's files array
 */
function filterLibrarySources(
  source: RegistrySource,
  originalSources: Record<string, SourceFile>,
) {
  const filtered = { ...originalSources };

  for (const [path, { id }] of Object.entries(filtered)) {
    // Keep non-library external files (they belong to a different registry item)
    const isLibrary = isLibrarySourcePath(path);
    const isExternal = isExternalRegistryItem(source, id);
    if (!isLibrary && isExternal) continue;

    // Remove library files and internal files
    delete filtered[path];
  }

  // If everything was filtered out, return originals (single-item sources)
  return Object.keys(filtered).length > 0 ? filtered : originalSources;
}

/** Type guard for preview module exports. */
function isObjectWithSource(
  obj: unknown,
): obj is { source: Record<string, Source> } {
  return (
    typeof obj === "object" && obj !== null && "source" in obj && !!obj.source
  );
}

// =============================================================================
// Content Transformation
// =============================================================================

/**
 * Transforms import paths in file content for registry output.
 * Converts relative imports to @/ alias paths for library sources.
 */
function transformFileContent(source: SourceFile) {
  return replaceImportPaths(source.content, (importPath) => {
    const absolutePath = resolveImportAbsolutePath(source.id, importPath);
    const relativePath = getRelativePathFromSrc(absolutePath);

    if (!isLibrarySourcePath(absolutePath)) {
      // Keep relative imports and data imports as relative
      const isRelativeImport = importPath.startsWith(".");
      const isDataImport = relativePath.startsWith(DATA_PREFIX);
      if (isRelativeImport || isDataImport) {
        const pathWithoutSuffix = removeFrameworkSuffix(importPath);
        return `./${basename(pathWithoutSuffix, extname(importPath))}`;
      }
      return importPath;
    }

    // Transform library imports to @/ alias without extension
    const registryPath = getRegistryItemPath(absolutePath);
    return `@/${registryPath.replace(/\.([jt]sx?)$/, "")}`;
  });
}

// =============================================================================
// Dependency Resolution
// =============================================================================

/** Collects npm package dependencies for a registry source. */
function getRegistryItemDependencies(source: RegistrySource) {
  const dependencies = new Set<string>();

  if ("utilities" in source) {
    // CSS module: collect dependencies from utilities
    for (const utility of Object.values(source.utilities)) {
      for (const dep of utility.dependencies) {
        if (dep.import) {
          dependencies.add(dep.import);
        }
      }
    }
  } else {
    // Library source: collect dependencies from all non-external source files
    const sources = getFlattenedSources(source);
    for (const sourceFile of Object.values(sources)) {
      const isLibrary = isLibrarySourcePath(sourceFile.id);
      const isExternal = isExternalRegistryItem(source, sourceFile.id);
      if (isLibrary && isExternal) continue;

      for (const dep of Object.keys(sourceFile.dependencies ?? {})) {
        if (isFrameworkDependency(dep)) continue;
        dependencies.add(dep);
      }
    }
  }

  return Array.from(dependencies).sort();
}

/** Collects other registry items this source depends on. */
function getRegistryItemRegistryDependencies(source: RegistrySource, url: URL) {
  const dependencies = new Set<string>();

  const addDependency = (name: string) => {
    dependencies.add(`${url.origin}/r/${name}.json`);
  };

  if ("utilities" in source) {
    // CSS module: depends on theme and other CSS modules
    addDependency("ariakit-tailwind");

    for (const utility of Object.values(source.utilities)) {
      for (const dep of utility.dependencies) {
        if (dep.module && dep.module !== source.id) {
          addDependency(`ak-${dep.module}`);
        }
      }
    }
  } else {
    // Library source: collect dependencies from imports and styles
    const sources = getFlattenedSources(source);

    for (const [sourcePath, { content }] of Object.entries(sources)) {
      // CSS style dependencies
      const styles = resolveDirectStyles(content);
      for (const style of styles) {
        if (style.module) {
          addDependency(`ak-${style.module}`);
        }
      }

      // Import path dependencies
      for (const importPath of getImportPaths(content)) {
        const absolutePath = resolveImportAbsolutePath(sourcePath, importPath);
        if (isLibrarySourcePath(absolutePath)) {
          addDependency(getRegistryItemName(absolutePath));
        }
      }

      // External library source files
      const isLibrary = isLibrarySourcePath(sourcePath);
      const isExternal = isExternalRegistryItem(source, sourcePath);
      if (isLibrary && isExternal) {
        addDependency(getRegistryItemName(sourcePath));
      }
    }
  }

  return Array.from(dependencies).sort();
}

// =============================================================================
// Registry Item Builders
// =============================================================================

function getThemeRegistryItem(url: URL, index = false): RegistryItem {
  return {
    name: "ariakit-tailwind",
    type: "registry:theme",
    dependencies: index ? undefined : ["@ariakit/tailwind"],
    meta: { href: `${url.origin}/r/ariakit-tailwind.json` },
    css: index ? undefined : THEME_CSS,
    cssVars: index
      ? undefined
      : {
          theme: THEME_CSS_VARS,
          light: THEME_CSS_VARS_LIGHT,
          dark: THEME_CSS_VARS_DARK,
        },
    files: [],
  };
}

function getRegistryItem({
  source,
  url,
  index = false,
}: GetRegistryItemParams) {
  if ("utilities" in source) {
    return getCssRegistryItem(source, url, index);
  }
  return getLibraryRegistryItem(source, url, index);
}

function getCssRegistryItem(
  source: ModuleJson,
  url: URL,
  index: boolean,
): RegistryItem {
  const name = `ak-${source.id}`;
  const filename = `${source.id}.css`;
  const type = getRegistryItemType(source.path);

  const content = index
    ? undefined
    : styleDefsToCss([
        ...Object.values(source.atProperties),
        ...Object.values(source.variants),
        ...Object.values(source.utilities),
      ]);

  const file: RegistryItemFile = {
    type,
    path: getRegistryItemPath(source.path),
    content,
  };

  return {
    name,
    type,
    meta: { href: `${url.origin}/r/${name}.json` },
    css: index ? undefined : { [`@import "../components/ui/${filename}"`]: {} },
    dependencies: index ? undefined : getRegistryItemDependencies(source),
    registryDependencies: index
      ? undefined
      : getRegistryItemRegistryDependencies(source, url),
    files: [file],
  };
}

function getLibraryRegistryItem(
  source: Source | SourceFile,
  url: URL,
  index: boolean,
): RegistryItem | null {
  const originalSources = getFlattenedSources(source);
  const filteredSources = filterLibrarySources(source, originalSources);
  const firstPath = Object.keys(filteredSources)[0];

  if (!firstPath) return null;

  const name = getRegistryItemName(firstPath);
  const type = getRegistryItemType(firstPath);
  const folderName = getExamplesFolderName(firstPath);

  const files = Object.values(filteredSources).map((sourceFile) => {
    const fileType = getRegistryItemType(sourceFile.id);
    const needsUseClient =
      fileType === "registry:ui" || fileType === "registry:example";

    const content = index ? undefined : transformFileContent(sourceFile);
    const contentWithDirective =
      index || !needsUseClient ? content : `"use client";\n${content}`;

    // Determine the output path
    let path = getRegistryItemPath(sourceFile.id);
    const isExampleFile =
      type === "registry:example" && fileType === "registry:example";
    if (isExampleFile) {
      path = `registry/examples/${folderName}/${getRegistryItemFilename(sourceFile.id)}`;
    }

    // Target path for examples (where the file will be copied)
    const target =
      type === "registry:example"
        ? `components/${basename(folderName, extname(folderName))}/${getRegistryItemFilename(sourceFile.id)}`
        : undefined;

    return {
      type: fileType,
      path,
      target,
      content: index ? undefined : contentWithDirective,
    };
  });

  return {
    name,
    type,
    dependencies: index ? undefined : getRegistryItemDependencies(source),
    registryDependencies: index
      ? undefined
      : getRegistryItemRegistryDependencies(
          { ...source, sources: filteredSources },
          url,
        ),
    meta: { href: `${url.origin}/r/${name}.json` },
    files,
  };
}

// =============================================================================
// Data Loading
// =============================================================================

async function getPreviewSource(entry: CollectionEntry<"previews">) {
  try {
    const previewPath = `../../examples/${entry.id}/preview.astro`;
    const loadPreview = previewImports[previewPath];
    const mod = await loadPreview?.();
    if (!isObjectWithSource(mod)) {
      throw new Error(`Preview source not found for ${entry.id}`);
    }
    return mod.source;
  } catch (error) {
    logger.error("Failed to load preview source", entry.id, error);
    return null;
  }
}

async function getRegistryItemSources() {
  const sourceMap = new Map<string, RegistrySource>();
  const previews = await getCollection("previews");

  // Add CSS modules from styles.json
  for (const module of stylesJson.modules) {
    sourceMap.set(getRegistryItemName(module.path), module);
  }

  // Add sources from preview examples
  for (const preview of previews) {
    const sources = await getPreviewSource(preview);
    if (!sources) continue;

    for (const framework of preview.data.frameworks) {
      const source = sources[framework];
      if (!source) continue;

      // Register individual library source files
      for (const [path, sourceFile] of Object.entries(source.sources)) {
        if (!isLibrarySourcePath(path)) continue;
        if (!sourceFile) continue;
        sourceMap.set(getRegistryItemName(path), sourceFile);
      }

      // Register the example as a whole (keyed by its first file)
      const firstPath = Object.keys(source.sources)[0];
      if (firstPath) {
        sourceMap.set(getRegistryItemName(firstPath), source);
      }
    }
  }

  return sourceMap;
}

// =============================================================================
// API Route Handler
// =============================================================================

export const GET: APIRoute = async ({ request, params }) => {
  const url = new URL(request.url);

  if (!params.registry) {
    return notFound();
  }

  const paramsObject = Object.fromEntries(url.searchParams.entries());
  const validation = queryParamsSchema.safeParse(paramsObject);

  if (!validation.success) {
    return badRequest(validation.error.message);
  }

  const sources = await getRegistryItemSources();

  // Handle registry index
  if (params.registry === "registry.json") {
    const items = [
      getThemeRegistryItem(url, true),
      ...Array.from(sources.values())
        .map((source) => getRegistryItem({ source, url, index: true }))
        .filter(nonNullable),
    ];

    const registry: Registry = {
      name: "Ariakit",
      homepage: "https://ariakit.com",
      items,
    };

    return Response.json(registry);
  }

  // Handle theme item
  if (params.registry === "ariakit-tailwind.json") {
    return Response.json(getThemeRegistryItem(url));
  }

  // Handle individual registry items
  const itemName = params.registry.replace(".json", "");
  const source = sources.get(itemName);

  if (!source) {
    return notFound();
  }

  return Response.json(getRegistryItem({ source, url }));
};

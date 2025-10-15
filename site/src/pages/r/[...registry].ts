import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";
import { basename, extname, join } from "node:path";
import type { APIRoute } from "astro";
import type { Registry, RegistryItem } from "shadcn/schema";
import { z } from "zod";
import { markdownToHtml } from "#app/lib/content.ts";
import { getFramework, isFramework } from "#app/lib/frameworks.ts";
import type { Source } from "#app/lib/source.ts";
import { getImportPaths, replaceImportPaths } from "#app/lib/source.ts";
import type { ModuleJson } from "#app/lib/styles.ts";
import stylesJson from "#app/styles/styles.json" with { type: "json" };

export const prerender = false;

type RegistryFiles = NonNullable<RegistryItem["files"]>;
type RegistryFile = RegistryFiles[number];

type RegistryIndexResponse = Registry;

interface BuildRegistryIndexParams {
  previews: CollectionEntry<"previews">[];
  baseUrl: string;
  includeExtension?: boolean;
  queryString?: string;
}

interface BuildRegistryItemParams {
  itemSlug: string;
  previews: CollectionEntry<"previews">[];
  baseUrl?: string;
  includeExtension?: boolean;
  queryString?: string;
}

const examples = import.meta.glob("../../examples/**/preview.astro");

// Cache for UI and lib registry items (cleared on each request)
const uiLibCache = new Map<string, RegistryItem>();

/**
 * Scan all preview sources to find _lib files and their sources
 */
async function getLibFileSources(
  previews: CollectionEntry<"previews">[],
): Promise<Map<string, Source>> {
  const libSources = new Map<string, Source>();

  for (const preview of previews) {
    const sources = await getPreviewSources(preview);
    if (!sources) {
      continue;
    }

    for (const framework of preview.data.frameworks) {
      if (!isFramework(framework)) {
        continue;
      }
      const source = sources[framework];
      if (!source) {
        continue;
      }

      // Check all files in this source for _lib files
      for (const [filename, fileData] of Object.entries(source.files)) {
        const fileId = fileData.id;

        // Check if this is a _lib file
        if (
          isAriakitLibFile(fileId) ||
          isReactAriaLibFile(fileId) ||
          isReactLibFile(fileId)
        ) {
          const registryName = getLibRegistryName(fileId);
          if (registryName && !libSources.has(registryName)) {
            // Create a minimal source object for this _lib file
            const libSource: Source = {
              name: registryName,
              files: { [filename]: fileData },
              sources: {},
              dependencies: source.dependencies,
              devDependencies: source.devDependencies,
              // Use per-file styles instead of source-level styles
              styles: fileData.styles || [],
            };
            libSources.set(registryName, libSource);
          }
        }
      }
    }
  }

  return libSources;
}

export const GET: APIRoute = async ({ request }) => {
  // Clear caches for each request
  uiLibCache.clear();

  const url = new URL(request.url);
  const segments = getRequestSegments(url.pathname);
  const previews = await getCollection("previews");

  // Define query parameters schema
  const queryParamsSchema = z.object({
    ext: z
      .string()
      .optional()
      .refine((val) => val === undefined || val === "true" || val === "false", {
        message: "ext must be 'true' or 'false'",
      }),
  });

  // Validate query parameters
  const paramsObject = Object.fromEntries(url.searchParams.entries());
  const validation = queryParamsSchema.safeParse(paramsObject);

  if (!validation.success) {
    return new Response(
      JSON.stringify({
        error: "Invalid query parameters",
        details: validation.error.format(),
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }

  // Parse query parameters
  const includeExtension = url.searchParams.get("ext") === "true";
  const queryString = url.searchParams.toString();
  const baseUrl = `${url.protocol}//${url.host}`;

  if (!segments.length || segments[0] === "registry.json") {
    const registry = await buildRegistryIndex({
      previews,
      baseUrl,
      includeExtension,
      queryString,
    });
    return Response.json({
      $schema: "https://ui.shadcn.com/schema/registry.json",
      ...registry,
    });
  }

  if (segments.length !== 1) {
    return notFound();
  }

  const itemSlug = segments[0]?.replace(/\.json$/, "");
  if (!itemSlug || itemSlug === "registry") {
    const registry = await buildRegistryIndex({
      previews,
      baseUrl,
      includeExtension,
      queryString,
    });
    return Response.json({
      $schema: "https://ui.shadcn.com/schema/registry.json",
      ...registry,
    });
  }

  const registryItem = await buildRegistryItem({
    itemSlug,
    previews,
    baseUrl,
    includeExtension,
    queryString,
  });
  if (!registryItem) {
    return notFound();
  }

  return Response.json(registryItem);
};

function getRequestSegments(pathname: string) {
  return pathname.split("/").filter((segment) => segment && segment !== "r");
}

function notFound() {
  return new Response("Not found", { status: 404 });
}

/**
 * Check if a file path is from _lib/ariakit
 */
function isAriakitLibFile(filePath: string): boolean {
  return filePath.includes("/_lib/ariakit/");
}

/**
 * Check if a file path is from _lib/react-aria
 */
function isReactAriaLibFile(filePath: string): boolean {
  return filePath.includes("/_lib/react-aria/");
}

/**
 * Check if a file path is from _lib/react
 */
function isReactLibFile(filePath: string): boolean {
  return (
    filePath.includes("/_lib/react/") && !filePath.includes("/_lib/react-aria/")
  );
}

/**
 * Get the registry name for a lib file based on its path
 */
function getLibRegistryName(filePath: string): string {
  if (isAriakitLibFile(filePath)) {
    const filename = basename(filePath, ".tsx").replace(/\.react$/, "");
    return `ariakit-react-${filename}`;
  }
  if (isReactAriaLibFile(filePath)) {
    const filename = basename(filePath, ".tsx").replace(/\.react$/, "");
    return `react-aria-${filename}`;
  }
  if (isReactLibFile(filePath)) {
    return basename(filePath, ".ts");
  }
  return "";
}

/**
 * Get the import path for a lib file in registry format
 */
function getLibImportPath(filePath: string, includeExtension = false): string {
  if (isAriakitLibFile(filePath)) {
    const filename = basename(filePath, ".tsx").replace(/\.react$/, "");
    const ext = includeExtension ? ".tsx" : "";
    return `@/registry/ui/${filename}${ext}`;
  }
  if (isReactAriaLibFile(filePath)) {
    const filename = basename(filePath, ".tsx").replace(/\.react$/, "");
    const ext = includeExtension ? ".tsx" : "";
    return `@/registry/ui/${filename}${ext}`;
  }
  if (isReactLibFile(filePath)) {
    const filename = basename(filePath, ".ts");
    const ext = includeExtension ? ".ts" : "";
    const registryType = filename.startsWith("use-") ? "hook" : "lib";
    return `@/registry/${registryType}/${filename}${ext}`;
  }
  return "";
}

/**
 * Transform import paths to registry format
 */
function transformImportPaths(
  content: string,
  source: Source,
  allLibSources?: Map<string, Source>,
  includeExtension = false,
): string {
  return replaceImportPaths(content, (path) => {
    // Skip non-relative imports
    if (!path.startsWith("./") && !path.startsWith("../")) {
      return path;
    }

    // Extract the filename from the import path
    const importFilename = basename(path);
    // Remove extension for basename comparison
    const importBasename = importFilename.replace(/\.[jt]sx?$/, "");

    // First check if this import matches a file in the current source
    for (const fileData of Object.values(source.files)) {
      const fileId = fileData.id;
      const sourceFilename = basename(fileId);
      // Remove extension for basename comparison
      const sourceBasename = sourceFilename.replace(/\.[jt]sx?$/, "");

      // Match by filename or basename
      if (
        importFilename === sourceFilename ||
        importBasename === sourceBasename
      ) {
        // Check if this is a lib file - if so, transform to registry path
        if (
          isAriakitLibFile(fileId) ||
          isReactAriaLibFile(fileId) ||
          isReactLibFile(fileId)
        ) {
          return getLibImportPath(fileId, includeExtension);
        }
        // If it's a data file, keep it relative
        if (path.includes("/data/") || path.includes("orders")) {
          return `./${basename(path, extname(path))}`;
        }
        // For other files in the same block, keep relative
        if (!includeExtension) {
          return path.replace(/\.[^.]+$/, "");
        }
        return path;
      }
    }

    // If not found in current source, check all lib sources if available
    if (allLibSources) {
      for (const libSource of allLibSources.values()) {
        for (const [libFilename, fileData] of Object.entries(libSource.files)) {
          const fileId = fileData.id;
          // Remove extension for basename comparison
          const libBasename = libFilename.replace(/\.[jt]sx?$/, "");

          // Match by filename or basename
          if (
            importFilename === libFilename ||
            importBasename === libBasename
          ) {
            // Transform to registry path
            return getLibImportPath(fileId, includeExtension);
          }
        }
      }
    }

    return path;
  });
}

/**
 * Extract registry dependencies from source
 */
function extractRegistryDependencies(
  source: Source,
  allLibSources?: Map<string, Source>,
): string[] {
  const dependencies = new Set<string>();

  // Check all file IDs in the source
  for (const file of Object.values(source.files)) {
    const fileId = file.id;

    // Add UI and lib dependencies based on file paths
    if (
      isAriakitLibFile(fileId) ||
      isReactAriaLibFile(fileId) ||
      isReactLibFile(fileId)
    ) {
      const registryName = getLibRegistryName(fileId);
      if (registryName) {
        dependencies.add(registryName);
      }
    }

    // Also extract dependencies from imports in the file content
    if (allLibSources) {
      const imports = getImportPaths(file.content);
      for (const importPath of imports) {
        if (importPath.startsWith("./") || importPath.startsWith("../")) {
          const importFilename = basename(importPath);
          const importBasename = importFilename.replace(/\.[jt]sx?$/, "");

          // Determine which library this file belongs to
          const isCurrentAriakit = isAriakitLibFile(fileId);
          const isCurrentReactAria = isReactAriaLibFile(fileId);
          const isCurrentReact = isReactLibFile(fileId);

          // Check if this import matches any lib file from the same library
          for (const [registryName, libSource] of allLibSources.entries()) {
            for (const [libFilename, libFileData] of Object.entries(
              libSource.files,
            )) {
              const libBasename = libFilename.replace(/\.[jt]sx?$/, "");
              const libFileId = libFileData.id;

              // Only match if basenames match AND they're from the same library
              const basenameMatches =
                importFilename === libFilename ||
                importBasename === libBasename;

              if (!basenameMatches) {
                continue;
              }

              // Check if the lib file is from a compatible library
              // - Ariakit files can only import from ariakit or react (not react-aria)
              // - React-aria files can only import from react-aria or react (not ariakit)
              // - React files can be imported by anyone
              const isLibFromReact = isReactLibFile(libFileId);
              const isCompatible =
                isLibFromReact || // React utils/hooks can be used by anyone
                (isCurrentAriakit && isAriakitLibFile(libFileId)) ||
                (isCurrentReactAria && isReactAriaLibFile(libFileId)) ||
                (isCurrentReact && isReactLibFile(libFileId));

              if (isCompatible) {
                dependencies.add(registryName);
              }
            }
          }
        }
      }
    }

    // Extract style dependencies from per-file styles
    if (file.styles) {
      for (const style of file.styles) {
        if (style.module) {
          dependencies.add(`ak-${style.module}`);
        }
      }
    }
  }

  // Also extract style dependencies from source-level styles (fallback)
  for (const style of source.styles) {
    if (style.module) {
      dependencies.add(`ak-${style.module}`);
    }
  }

  return Array.from(dependencies).sort();
}

/**
 * Convert CSS properties to registry CSS format
 */
function propertiesToCss(
  properties: Array<{
    name: string;
    value: string | Record<string, never> | any[];
  }>,
): Record<string, any> {
  const css: Record<string, any> = {};

  for (const prop of properties) {
    if (Array.isArray(prop.value)) {
      // Nested properties
      css[prop.name] = propertiesToCss(prop.value);
    } else {
      // Regular property
      css[prop.name] = prop.value;
    }
  }

  return css;
}

/**
 * Build style registry items from styles.json
 */
function buildStyleRegistryItems(
  baseUrl?: string,
  queryString?: string,
): RegistryItem[] {
  const items: RegistryItem[] = [];

  for (const module of stylesJson.modules as ModuleJson[]) {
    const css: Record<string, any> = {};
    const registryDependencies = new Set<string>();
    const packageDependencies = new Set<string>();

    // Add utilities
    for (const [name, utility] of Object.entries(module.utilities)) {
      css[`@utility ${name}`] = propertiesToCss(utility.properties);

      // Collect dependencies
      for (const dep of utility.dependencies) {
        if (dep.module && dep.module !== module.id) {
          registryDependencies.add(`ak-${dep.module}`);
        }
        if (dep.import === "@ariakit/tailwind") {
          packageDependencies.add("@ariakit/tailwind");
        }
      }
    }

    // Add variants
    for (const [name, variant] of Object.entries(module.variants)) {
      css[`@custom-variant ${name}`] = propertiesToCss(variant.properties);

      // Collect dependencies
      for (const dep of variant.dependencies) {
        if (dep.module && dep.module !== module.id) {
          registryDependencies.add(`ak-${dep.module}`);
        }
        if (dep.import === "@ariakit/tailwind") {
          packageDependencies.add("@ariakit/tailwind");
        }
      }
    }

    // Add at-properties
    for (const [name, atProperty] of Object.entries(module.atProperties)) {
      const atRule: Record<string, any> = {};
      if (atProperty.syntax) {
        atRule.syntax = atProperty.syntax;
      }
      if (atProperty.inherits !== null) {
        atRule.inherits = atProperty.inherits;
      }
      if (atProperty.initialValue) {
        atRule["initial-value"] = atProperty.initialValue;
      }
      css[`@property ${name}`] = atRule;
    }

    const item: RegistryItem = {
      name: `ak-${module.id}`,
      type: "registry:style",
      css,
    };

    // Only add registryDependencies if there are any
    if (registryDependencies.size > 0) {
      const styleDeps = Array.from(registryDependencies).sort();
      // Convert to full URLs if baseUrl is provided
      item.registryDependencies = baseUrl
        ? styleDeps.map(
            (dep) =>
              `${baseUrl}/r/${dep}.json${queryString ? `?${queryString}` : ""}`,
          )
        : styleDeps;
    }

    // Add package dependencies if any
    if (packageDependencies.size > 0) {
      item.dependencies = Array.from(packageDependencies).sort();
    }

    items.push(item);
  }

  return items;
}

/**
 * Build UI registry item from _lib file
 */
async function buildUIRegistryItem(
  itemName: string,
  previews: CollectionEntry<"previews">[],
  baseUrl?: string,
  includeExtension = false,
  queryString?: string,
): Promise<RegistryItem | null> {
  // Check cache
  if (uiLibCache.has(itemName)) {
    return uiLibCache.get(itemName) || null;
  }

  const isAriakit = itemName.startsWith("ariakit-react-");
  const isReactAria = itemName.startsWith("react-aria-");

  if (!isAriakit && !isReactAria) {
    return null;
  }

  // Get the source from lib file sources
  const libSources = await getLibFileSources(previews);
  const source = libSources.get(itemName);

  if (!source) {
    return null;
  }

  const files: RegistryFiles = [];
  const dependencies = new Set<string>();
  const registryDependencies = new Set<string>();

  // Add dependencies
  for (const [pkg, version] of Object.entries(source.dependencies)) {
    dependencies.add(`${pkg}@^${version.replace(/^\^/, "")}`);
  }

  // Extract registry dependencies
  const extractedDeps = extractRegistryDependencies(source, libSources);
  for (const dep of extractedDeps) {
    if (dep !== itemName) {
      registryDependencies.add(dep);
    }
  }

  // Process files
  for (const [filename, fileContent] of Object.entries(source.files)) {
    const transformedContent = transformImportPaths(
      fileContent.content,
      source,
      libSources,
      includeExtension,
    );

    files.push({
      path: join("registry", "ui", filename),
      content: transformedContent,
      type: "registry:ui",
    });
  }

  const uiDeps = Array.from(registryDependencies).sort();
  const item: RegistryItem = {
    name: itemName,
    type: "registry:ui",
    description: "",
    // Convert to full URLs if baseUrl is provided
    registryDependencies: baseUrl
      ? uiDeps.map(
          (dep) =>
            `${baseUrl}/r/${dep}.json${queryString ? `?${queryString}` : ""}`,
        )
      : uiDeps,
    dependencies: Array.from(dependencies).sort(),
    files,
  };

  uiLibCache.set(itemName, item);
  return item;
}

/**
 * Build hook registry item from _lib/react/use-* file
 */
async function buildHookRegistryItem(
  itemName: string,
  previews: CollectionEntry<"previews">[],
  baseUrl?: string,
  includeExtension = false,
  queryString?: string,
): Promise<RegistryItem | null> {
  // Check cache
  if (uiLibCache.has(itemName)) {
    return uiLibCache.get(itemName) || null;
  }

  // Get the source from lib file sources
  const libSources = await getLibFileSources(previews);
  const source = libSources.get(itemName);

  if (!source) {
    return null;
  }

  const files: RegistryFiles = [];
  const dependencies = new Set<string>();
  const registryDependencies = new Set<string>();

  // Add dependencies
  for (const [pkg, version] of Object.entries(source.dependencies)) {
    dependencies.add(`${pkg}@^${version.replace(/^\^/, "")}`);
  }

  // Extract registry dependencies
  const extractedDeps = extractRegistryDependencies(source, libSources);
  for (const dep of extractedDeps) {
    if (dep !== itemName) {
      registryDependencies.add(dep);
    }
  }

  // Process files
  for (const [filename, fileContent] of Object.entries(source.files)) {
    const transformedContent = transformImportPaths(
      fileContent.content,
      source,
      libSources,
      includeExtension,
    );

    files.push({
      path: join("registry", "hook", filename),
      content: transformedContent,
      type: "registry:hook",
    });
  }

  const hookDeps = Array.from(registryDependencies).sort();
  const item: RegistryItem = {
    name: itemName,
    type: "registry:hook",
    description: "",
    // Convert to full URLs if baseUrl is provided
    registryDependencies: baseUrl
      ? hookDeps.map(
          (dep) =>
            `${baseUrl}/r/${dep}.json${queryString ? `?${queryString}` : ""}`,
        )
      : hookDeps,
    dependencies: Array.from(dependencies).sort(),
    files,
  };

  uiLibCache.set(itemName, item);
  return item;
}

/**
 * Build lib registry item from _lib/react file
 */
async function buildLibRegistryItem(
  itemName: string,
  previews: CollectionEntry<"previews">[],
  baseUrl?: string,
  includeExtension = false,
  queryString?: string,
): Promise<RegistryItem | null> {
  // Check cache
  if (uiLibCache.has(itemName)) {
    return uiLibCache.get(itemName) || null;
  }

  // Get the source from lib file sources
  const libSources = await getLibFileSources(previews);
  const source = libSources.get(itemName);

  if (!source) {
    return null;
  }

  const files: RegistryFiles = [];
  const dependencies = new Set<string>();
  const registryDependencies = new Set<string>();

  // Add dependencies
  for (const [pkg, version] of Object.entries(source.dependencies)) {
    dependencies.add(`${pkg}@^${version.replace(/^\^/, "")}`);
  }

  // Extract registry dependencies
  const extractedLibDeps = extractRegistryDependencies(source, libSources);
  for (const dep of extractedLibDeps) {
    if (dep !== itemName) {
      registryDependencies.add(dep);
    }
  }

  // Process files
  for (const [filename, fileContent] of Object.entries(source.files)) {
    const transformedContent = transformImportPaths(
      fileContent.content,
      source,
      libSources,
      includeExtension,
    );

    files.push({
      path: join("registry", "lib", filename),
      content: transformedContent,
      type: "registry:lib",
    });
  }

  const libDeps = Array.from(registryDependencies).sort();
  const item: RegistryItem = {
    name: itemName,
    type: "registry:lib",
    description: "",
    // Convert to full URLs if baseUrl is provided
    registryDependencies: baseUrl
      ? libDeps.map(
          (dep) =>
            `${baseUrl}/r/${dep}.json${queryString ? `?${queryString}` : ""}`,
        )
      : libDeps,
    dependencies: Array.from(dependencies).sort(),
    files,
  };

  uiLibCache.set(itemName, item);
  return item;
}

async function buildRegistryIndex(params: BuildRegistryIndexParams) {
  const { previews, baseUrl, queryString } = params;

  const items: RegistryItem[] = [];

  // Add block items from previews
  for (const preview of previews) {
    const sources = await getPreviewSources(preview);
    if (!sources) {
      continue;
    }
    for (const framework of preview.data.frameworks) {
      if (!isFramework(framework)) {
        continue;
      }
      const source = sources[framework];
      if (!source) {
        continue;
      }
      const slug = getRegistrySlug(preview, framework);
      const description = await getPreviewDescription(preview);
      items.push({
        name: slug,
        type: "registry:block",
        title: preview.data.title,
        description: description || "",
        meta: {
          href: `${baseUrl}/r/${slug}.json`,
        },
      });
    }
  }

  // Add UI items from _lib/ariakit
  const ariakitFiles = [
    "disclosure.react.tsx",
    "list.react.tsx",
    "nav.react.tsx",
    "progress.react.tsx",
    "select.react.tsx",
    "sidebar.react.tsx",
    "table.react.tsx",
  ];
  for (const file of ariakitFiles) {
    const filename = basename(file, ".tsx").replace(/\.react$/, "");
    const itemName = `ariakit-react-${filename}`;
    items.push({
      name: itemName,
      type: "registry:ui",
      description: "",
      meta: {
        href: `${baseUrl}/r/${itemName}.json`,
      },
    });
  }

  // Add UI items from _lib/react-aria
  const reactAriaFiles = [
    "disclosure.react.tsx",
    "list.react.tsx",
    "progress.react.tsx",
  ];
  for (const file of reactAriaFiles) {
    const filename = basename(file, ".tsx").replace(/\.react$/, "");
    const itemName = `react-aria-${filename}`;
    items.push({
      name: itemName,
      type: "registry:ui",
      description: "",
      meta: {
        href: `${baseUrl}/r/${itemName}.json`,
      },
    });
  }

  // Add lib and hook items from _lib/react
  const libFiles = ["use-is-mobile.ts", "utils.ts"];
  for (const file of libFiles) {
    const filename = basename(file, ".ts");
    const isHook = filename.startsWith("use-");
    items.push({
      name: filename,
      type: isHook ? "registry:hook" : "registry:lib",
      description: "",
      meta: {
        href: `${baseUrl}/r/${filename}.json`,
      },
    });
  }

  // Add style items
  const styleItems = buildStyleRegistryItems(baseUrl, queryString);
  for (const styleItem of styleItems) {
    items.push({
      name: styleItem.name,
      type: "registry:style",
      description: "",
      meta: {
        href: `${baseUrl}/r/${styleItem.name}.json`,
      },
    });
  }

  const registry: RegistryIndexResponse = {
    name: "Ariakit",
    homepage: "https://ariakit.com",
    items: items.sort((a, b) => a.name.localeCompare(b.name)),
  };

  return registry;
}

async function buildRegistryItem(params: BuildRegistryItemParams) {
  const { itemSlug, previews, baseUrl, includeExtension, queryString } = params;

  // Check if it's a style item (starts with ak-)
  if (itemSlug.startsWith("ak-")) {
    const styleItems = buildStyleRegistryItems(baseUrl, queryString);
    const styleItem = styleItems.find((item) => item.name === itemSlug);
    if (styleItem) {
      return styleItem;
    }
  }

  // Check if it's a UI item (ariakit-react-* or react-aria-*)
  if (
    itemSlug.startsWith("ariakit-react-") ||
    itemSlug.startsWith("react-aria-")
  ) {
    const result = await buildUIRegistryItem(
      itemSlug,
      previews,
      baseUrl,
      includeExtension,
      queryString,
    );
    if (result) {
      return result;
    }
  }

  // Check if it's a hook item (use-*)
  if (itemSlug.startsWith("use-")) {
    const hookResult = await buildHookRegistryItem(
      itemSlug,
      previews,
      baseUrl,
      includeExtension,
      queryString,
    );
    if (hookResult) {
      return hookResult;
    }
  }

  // Check if it's a lib item
  const libResult = await buildLibRegistryItem(
    itemSlug,
    previews,
    baseUrl,
    includeExtension,
    queryString,
  );
  if (libResult) {
    return libResult;
  }

  // Check if it's a block item from previews
  for (const preview of previews) {
    const sources = await getPreviewSources(preview);
    if (!sources) {
      continue;
    }
    for (const framework of preview.data.frameworks) {
      if (!isFramework(framework)) {
        continue;
      }
      const source = sources[framework];
      if (!source) {
        continue;
      }
      const slug = getRegistrySlug(preview, framework);
      if (slug !== itemSlug) {
        continue;
      }
      return buildRegistryItemDetail({
        preview,
        framework,
        source,
        baseUrl,
        previews,
        includeExtension,
        queryString,
      });
    }
  }

  return null;
}

interface BuildRegistryItemDetailParams {
  preview: CollectionEntry<"previews">;
  framework: keyof typeof import("#app/lib/frameworks.ts").frameworks;
  source: Source;
  baseUrl?: string;
  previews: CollectionEntry<"previews">[];
  includeExtension?: boolean;
  queryString?: string;
}

async function buildRegistryItemDetail(params: BuildRegistryItemDetailParams) {
  const {
    preview,
    framework,
    source,
    baseUrl,
    previews,
    queryString,
    includeExtension,
  } = params;
  const slug = getRegistrySlug(preview, framework);
  const frameworkDetails = getFramework(framework);
  const description = await getPreviewDescription(preview);

  const files = await buildRegistryFiles({
    preview,
    slug,
    source,
    previews,
    includeExtension,
  });
  if (!files.length) {
    return null;
  }

  const dependencies = new Set<string>();
  const registryDependencies = new Set<string>();

  // Add dependencies with ^ prefix (excluding framework dependencies)
  const frameworkDeps = frameworkDetails.dependencies as readonly string[];
  for (const [pkg, version] of Object.entries(source.dependencies)) {
    // Skip framework dependencies as they're already defined in frameworks.ts
    if (frameworkDeps.includes(pkg)) {
      continue;
    }
    dependencies.add(`${pkg}@^${version.replace(/^\^/, "")}`);
  }

  // Extract registry dependencies
  const libSources = await getLibFileSources(previews);
  const extractedBlockDeps = extractRegistryDependencies(source, libSources);
  for (const dep of extractedBlockDeps) {
    registryDependencies.add(dep);
  }

  const blockDeps = Array.from(registryDependencies).sort();
  const item: RegistryItem = {
    name: slug,
    type: "registry:block",
    title: preview.data.title,
    description: description || "",
    // Convert to full URLs if baseUrl is provided
    registryDependencies: baseUrl
      ? blockDeps.map(
          (dep) =>
            `${baseUrl}/r/${dep}.json${queryString ? `?${queryString}` : ""}`,
        )
      : blockDeps,
    dependencies: Array.from(dependencies).sort(),
    meta: {
      href: `${slug}.json`,
    },
    files,
  };

  return item;
}

interface BuildRegistryFilesParams {
  preview: CollectionEntry<"previews">;
  slug: string;
  source: Source;
  previews: CollectionEntry<"previews">[];
  includeExtension?: boolean;
}

async function buildRegistryFiles(params: BuildRegistryFilesParams) {
  const { slug, source, previews, includeExtension } = params;

  const entries: RegistryFiles = [];

  const pushFile = (file: RegistryFile) => {
    entries.push(file);
  };

  // Get lib sources for transform
  const libSources = await getLibFileSources(previews);

  // Transform import paths for all files, but exclude _lib files
  for (const [filename, content] of Object.entries(source.files)) {
    // Skip _lib files - they should be registry dependencies, not included files
    if (
      isAriakitLibFile(content.id) ||
      isReactAriaLibFile(content.id) ||
      isReactLibFile(content.id)
    ) {
      continue;
    }

    const transformedContent = transformImportPaths(
      content.content,
      source,
      libSources,
      includeExtension,
    );
    const isMainFile = filename === "index.tsx" || filename === "index.ts";
    const finalFilename = isMainFile ? "index.tsx" : filename;

    pushFile({
      path: join("registry", "block", slug, finalFilename),
      content: transformedContent,
      type: "registry:block",
    });
  }

  return entries;
}

async function getPreviewSources(entry: CollectionEntry<"previews">) {
  try {
    const previewModule = (await examples[
      `../../examples/${entry.id}/preview.astro`
    ]?.()) as {
      source?: Record<string, Source>;
    };
    if (!previewModule?.source) {
      return null;
    }
    return previewModule.source;
  } catch (error) {
    console.error("Failed to load preview source", entry.id, error);
    return null;
  }
}

async function getPreviewDescription(entry: CollectionEntry<"previews">) {
  if (!entry.body) {
    return null;
  }
  return markdownToHtml(entry.body);
}

// Removed: getPreviewMarkdown is no longer used since we don't generate README.md

function getRegistrySlug(
  preview: CollectionEntry<"previews">,
  framework: string,
) {
  return `${framework}-${preview.id.replaceAll("/", "-")}`;
}

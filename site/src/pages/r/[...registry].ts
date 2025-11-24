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

const logger = createLogger("registry");

export const prerender = false;

const previewImports = import.meta.glob("../../examples/**/preview.astro");
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

const queryParamsSchema = z.object({
  ariakit: z.stringbool().default(true),
});

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

  if (params.registry === "registry.json") {
    const items = [
      getThemeRegistryItem(url, true),
      ...Array.from(sources.values())
        .map((source) => getRegistryItem({ source, url, index: true }))
        .filter(nonNullable),
    ];

    const registry = {
      name: "Ariakit",
      homepage: "https://ariakit.com",
      items: items,
    } satisfies Registry;
    return Response.json(registry);
  }

  if (params.registry === "ariakit-tailwind.json") {
    return Response.json(getThemeRegistryItem(url));
  }

  const source = sources.get(params.registry.replace(".json", ""));
  if (!source) {
    return notFound();
  }

  return Response.json(getRegistryItem({ source, url }));
};

async function getRegistryItemSources() {
  const sourceMap = new Map<string, ModuleJson | Source | SourceFile>();
  const previews = await getCollection("previews");

  for (const module of stylesJson.modules) {
    sourceMap.set(getRegistryItemName(module.path), module);
  }

  for (const preview of previews) {
    const sources = await getPreviewSource(preview);
    if (!sources) continue;
    for (const framework of preview.data.frameworks) {
      const source = sources[framework];
      if (!source) continue;

      for (const [path] of Object.entries(source.sources)) {
        if (!isLibSourcePath(path)) continue;
        if (!source.sources[path]) continue;
        sourceMap.set(getRegistryItemName(path), source.sources[path]);
      }
      const firstPath = Object.keys(source.sources)[0];
      if (firstPath) {
        sourceMap.set(getRegistryItemName(firstPath), source);
      }
    }
  }

  return sourceMap;
}

type RegistryItemFile = NonNullable<RegistryItem["files"]>[number];

interface GetRegistryItemParams {
  source: Source | SourceFile | ModuleJson;
  url: URL;
  index?: boolean;
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
  const file: RegistryItemFile = {
    type,
    path: getRegistryItemPath(source.path),
    content: index
      ? undefined
      : styleDefsToCss([
          ...Object.values(source.atProperties),
          ...Object.values(source.variants),
          ...Object.values(source.utilities),
        ]),
  };

  const item: RegistryItem = {
    name,
    type,
    meta: {
      href: `${url.origin}/r/${name}.json`,
    },
    css: index ? undefined : { [`@import "../components/ui/${filename}"`]: {} },
    dependencies: index ? undefined : getRegistryItemDependencies(source),
    registryDependencies: index
      ? undefined
      : getRegistryItemRegistryDependencies(source, url),
    files: [file],
  };

  return item;
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

  const firstSourceName = getRegistryItemName(firstPath);
  const type = getRegistryItemType(firstPath);
  const firstSourceFile = getExamplesFolderName(firstPath);

  const item: RegistryItem = {
    name: firstSourceName,
    type,
    dependencies: !index ? getRegistryItemDependencies(source) : undefined,
    registryDependencies: !index
      ? getRegistryItemRegistryDependencies(
          { ...source, sources: filteredSources },
          url,
        )
      : undefined,
    meta: {
      href: `${url.origin}/r/${firstSourceName}.json`,
    },
    files: Object.values(filteredSources).map((source) => {
      const content = index ? undefined : transformFileContent(source);
      const contentUseClient = index
        ? undefined
        : ["registry:ui", "registry:example"].includes(
              getRegistryItemType(source.id),
            )
          ? `"use client";\n${content}`
          : content;

      let path = getRegistryItemPath(source.id);
      if (
        type === "registry:example" &&
        getRegistryItemType(source.id) === "registry:example"
      ) {
        path = `registry/examples/${firstSourceFile}/${getRegistryItemFilename(source.id)}`;
      }

      return {
        type: getRegistryItemType(source.id),
        path,
        target:
          type === "registry:example"
            ? `components/${basename(firstSourceFile, extname(firstSourceFile))}/${getRegistryItemFilename(source.id)}`
            : undefined,
        content: index ? undefined : contentUseClient,
      };
    }),
  };

  return item;
}

function transformFileContent(source: SourceFile) {
  return replaceImportPaths(source.content, (path) => {
    const absolutePath = resolveImportAbsolutePath(source.id, path);
    const relativeAbsolutePath = getSrcRelativePath(absolutePath);
    if (!isLibSourcePath(absolutePath)) {
      if (
        path.startsWith(".") ||
        relativeAbsolutePath.startsWith(DATA_PREFIX)
      ) {
        return `./${basename(removeFrameworkSuffix(path), extname(path))}`;
      }
      return path;
    }
    return `@/${getRegistryItemPath(absolutePath).replace(/\.([jt]sx?)$/, "")}`;
  });
}

function filterLibrarySources(
  source: Source | SourceFile,
  originalSources: Record<string, SourceFile>,
) {
  const sources = { ...originalSources };
  const libDeps = new Set<string>();

  for (const [path, { id }] of Object.entries(sources)) {
    if (!isLibSourcePath(path) && isExternalRegistryItem(source, id)) {
      continue;
    }
    delete sources[path];
    if (!libDeps.has(id)) {
      libDeps.add(id);
    }
  }
  return Object.keys(sources).length > 0 ? sources : originalSources;
}

function isLibSourcePath(sourcePath: string) {
  const relativePath = getSrcRelativePath(sourcePath);
  return (
    relativePath.startsWith(LIB_PREFIX) && !relativePath.startsWith(DATA_PREFIX)
  );
}

function getRegistryItemFilename(sourcePath: string) {
  const normalizedPath = normalizePath(sourcePath);
  return removeFrameworkSuffix(basename(normalizedPath));
}

function getExamplesFolderName(sourcePath: string) {
  const relativeDir = getSrcRelativePath(dirname(sourcePath));
  const withoutPrefix = relativeDir.startsWith(EXAMPLES_PREFIX)
    ? relativeDir.slice(EXAMPLES_PREFIX.length)
    : relativeDir;
  return withoutPrefix.replace("/", "-").replace("-_component", "");
}

function getRegistryItemName(sourcePath: string) {
  const relativePath = getSrcRelativePath(sourcePath);
  if (relativePath.endsWith(".css")) {
    return `ak-${basename(relativePath, ".css").replace(/^ak-/, "")}`;
  }

  const prefix = isLibSourcePath(relativePath)
    ? basename(dirname(relativePath))
    : `${relativePath.includes("/_component") ? "components" : "examples"}-${getExamplesFolderName(relativePath)}`;

  const filename = getRegistryItemFilename(relativePath);
  const filenameNoExt = basename(filename, extname(relativePath));
  const framework = getFrameworkByFilename(relativePath);

  if (!framework) {
    return `${prefix}-${filenameNoExt}`.replace(/-index$/, "");
  }

  const name = prefix.startsWith(framework)
    ? `${prefix}-${filenameNoExt}`
    : `${framework}-${prefix}-${filenameNoExt}`;

  return name.replace(/-index$/, "");
}

function getRegistryItemType(sourcePath: string) {
  const relativePath = getSrcRelativePath(sourcePath);
  if (relativePath.endsWith(".css")) return "registry:ui";
  if (relativePath.startsWith(REACT_UTILS_PREFIX)) return "registry:lib";
  if (relativePath.startsWith(REACT_HOOKS_PREFIX)) return "registry:hook";
  if (relativePath.startsWith(DATA_PREFIX)) return "registry:example";
  if (relativePath.startsWith(LIB_PREFIX)) return "registry:ui";
  if (relativePath.startsWith(EXAMPLES_PREFIX)) return "registry:example";
  return "registry:ui";
}

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

function getRegistryItemDependencies(source: Source | SourceFile | ModuleJson) {
  const dependencies = new Set<string>();

  if ("utilities" in source) {
    for (const utility of Object.values(source.utilities)) {
      for (const dep of utility.dependencies) {
        if (!dep.import) continue;
        dependencies.add(dep.import);
      }
    }
  } else {
    const sources = getFlattenedSources(source);
    for (const s of Object.values(sources)) {
      if (isLibSourcePath(s.id) && isExternalRegistryItem(source, s.id)) {
        continue;
      }
      for (const dep of Object.keys(s.dependencies ?? {})) {
        if (isFrameworkDependency(dep)) continue;
        dependencies.add(dep);
      }
    }
  }
  return Array.from(dependencies).sort();
}

function getRegistryItemRegistryDependencies(
  source: Source | SourceFile | ModuleJson,
  url: URL,
) {
  const dependencies = new Set<string>();

  if ("utilities" in source) {
    dependencies.add(`${url.origin}/r/ariakit-tailwind.json`);
    for (const utility of Object.values(source.utilities)) {
      for (const dep of utility.dependencies) {
        if (!dep.module) continue;
        if (dep.module === source.id) continue;
        dependencies.add(`${url.origin}/r/ak-${dep.module}.json`);
      }
    }
  } else {
    const sources = getFlattenedSources(source);

    for (const [pkg, { content }] of Object.entries(sources)) {
      const styles = resolveDirectStyles(content);

      for (const style of styles) {
        if (!style.module) continue;
        dependencies.add(`${url.origin}/r/ak-${style.module}.json`);
      }

      getImportPaths(content).forEach((importPath) => {
        const absolutePath = resolveImportAbsolutePath(pkg, importPath);
        if (!isLibSourcePath(absolutePath)) return;
        dependencies.add(
          `${url.origin}/r/${getRegistryItemName(absolutePath)}.json`,
        );
      });

      if (!isLibSourcePath(pkg) || !isExternalRegistryItem(source, pkg)) {
        continue;
      }
      dependencies.add(`${url.origin}/r/${getRegistryItemName(pkg)}.json`);
    }
  }

  return Array.from(dependencies).sort();
}

function getFlattenedSources(
  source: Source | SourceFile | ModuleJson,
): Record<string, SourceFile> {
  if ("sources" in source) {
    return source.sources;
  }
  if ("id" in source && !("utilities" in source)) {
    return { [source.id]: source as SourceFile };
  }
  return {};
}

function isExternalRegistryItem(
  source: Source | SourceFile | ModuleJson,
  targetId: string,
) {
  if ("name" in source) {
    return source.name !== getRegistryItemName(targetId);
  }
  if ("id" in source) {
    return source.id !== targetId;
  }
  return false;
}

const SRC_DIR_TOKEN = "/src/";

function normalizePath(value: string) {
  return value.replace(/\\/g, "/");
}

function getSrcRelativePath(value: string) {
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

function resolveImportAbsolutePath(fromPath: string, importPath: string) {
  if (importPath.startsWith(".")) {
    return normalizePath(join(dirname(fromPath), importPath));
  }
  if (importPath.startsWith("#app/")) {
    return normalizePath(`src/${importPath.slice("#app/".length)}`);
  }
  return importPath;
}

function isObjectWithSource(
  obj: unknown,
): obj is { source: Record<string, Source> } {
  return (
    typeof obj === "object" && obj !== null && "source" in obj && !!obj.source
  );
}

async function getPreviewSource(entry: CollectionEntry<"previews">) {
  try {
    const example = previewImports[`../../examples/${entry.id}/preview.astro`];
    const mod = await example?.();
    if (!isObjectWithSource(mod)) {
      throw new Error(`Preview source not found for ${entry.id}`);
    }
    return mod.source;
  } catch (error) {
    logger.error("Failed to load preview source", entry.id, error);
    return null;
  }
}

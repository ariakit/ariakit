import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";
import { basename, dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";
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
const moduleDir = fileURLToPath(new URL(".", import.meta.url));
const APP_DIR = join(moduleDir, "../../");
const EXAMPLES_DIR = join(APP_DIR, "examples");
const LIB_DIR = join(EXAMPLES_DIR, "_lib");
const DATA_DIR = join(LIB_DIR, "data");
const REACT_UTILS_DIR = join(LIB_DIR, "react-utils");
const REACT_HOOKS_DIR = join(LIB_DIR, "react-hooks");

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
    const items = Array.from(sources.values())
      .map((source) => getRegistryItem({ source, url, index: true }))
      .filter(nonNullable);

    const registry = {
      name: "Ariakit",
      homepage: "https://ariakit.com",
      items: items,
    } satisfies Registry;
    return Response.json(registry);
  }

  const source = sources.get(params.registry.replace(".json", ""));
  if (!source) {
    return notFound();
  }

  return Response.json(getRegistryItem({ source, url }));
};

async function getRegistryItemSources() {
  const sources2 = new Map<string, ModuleJson | Source | SourceFile>();
  const previews = await getCollection("previews");

  for (const module of stylesJson.modules) {
    sources2.set(getRegistryItemName(module.path), module);
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
        sources2.set(getRegistryItemName(path), source.sources[path]);
      }
      const firstPath = Object.keys(source.sources)[0];
      if (firstPath) {
        sources2.set(getRegistryItemName(firstPath), source);
      }
    }
  }

  return sources2;
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
    const name = `ak-${source.id}`;
    const filename = `${source.id}.css`;
    const type = getRegistryItemType(source.path);
    const file: RegistryItemFile = {
      type,
      path: getRegistryItemPath(source.path, name),
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
      css: index
        ? undefined
        : { [`@import "../components/ui/${filename}"`]: {} },
      dependencies: index ? undefined : getRegistryItemDependencies(source),
      registryDependencies: index
        ? undefined
        : getRegistryItemRegistryDependencies(source, url),
      files: [file],
    };

    return item;
  }

  const libDeps = new Set<string>();

  const originalSources =
    "sources" in source ? source.sources : { [source.id]: source };

  const sources = { ...originalSources };

  for (const [path, { id }] of Object.entries(sources)) {
    if (
      !isLibSourcePath(path) &&
      (("name" in source && source.name !== getRegistryItemName(id)) ||
        ("id" in source && source.id !== id))
    )
      continue;
    delete sources[path];
    const item = libDeps.has(id);
    if (item) continue;
    libDeps.add(id);
  }

  const ss = Object.keys(sources).length > 0 ? sources : originalSources;

  if (Object.keys(ss).length > 0) {
    const firstPath = Object.keys(ss)[0]!;
    const firstSourceName = getRegistryItemName(firstPath);
    const item: RegistryItem = {
      name: firstSourceName,
      type: getRegistryItemType(firstPath),
      dependencies: !index ? getRegistryItemDependencies(source) : undefined,
      registryDependencies: !index
        ? getRegistryItemRegistryDependencies({ ...source, sources: ss }, url)
        : undefined,
      meta: {
        href: `${url.origin}/r/${firstSourceName}.json`,
      },
      files: Object.values(ss).map((source) => ({
        type: getRegistryItemType(source.id),
        path: getRegistryItemPath(source.id, firstSourceName),
        content: index
          ? undefined
          : replaceImportPaths(source.content, (path) => {
              const absolutePath = path.startsWith(".")
                ? join(dirname(source.id), path)
                : path.replace("#app/", APP_DIR);
              if (!isLibSourcePath(absolutePath)) {
                if (path.startsWith(".") || absolutePath.startsWith(DATA_DIR)) {
                  return `./${basename(removeFrameworkSuffix(path), extname(path))}`;
                }
                return path;
              }
              return `@/${getRegistryItemPath(absolutePath, firstSourceName).replace(/\.([jt]sx?)$/, "")}`;
            }),
      })),
    };

    return item;
  }

  return null;
}

function isLibSourcePath(sourcePath: string) {
  return sourcePath.startsWith(LIB_DIR) && !sourcePath.startsWith(DATA_DIR);
}

function getRegistryItemFilename(sourcePath: string) {
  return removeFrameworkSuffix(basename(sourcePath));
}

function getExamplesFolderName(sourcePath: string) {
  return dirname(sourcePath)
    .replace(`${EXAMPLES_DIR}/`, "")
    .replace("/", "-")
    .replace("-_component", "");
}

function getRegistryItemName(sourcePath: string) {
  if (sourcePath.endsWith(".css")) {
    return `ak-${basename(sourcePath, ".css").replace(/^ak-/, "")}`;
  }
  const prefix = isLibSourcePath(sourcePath)
    ? basename(dirname(sourcePath))
    : `${sourcePath.includes("/_component") ? "components" : "examples"}-${getExamplesFolderName(sourcePath)}`;
  const filename = getRegistryItemFilename(sourcePath);
  const filenameNoExt = basename(filename, extname(sourcePath));
  const framework = getFrameworkByFilename(sourcePath);
  const name = framework
    ? prefix.startsWith(framework)
      ? `${prefix}-${filenameNoExt}`
      : `${framework}-${prefix}-${filenameNoExt}`
    : `${prefix}-${filenameNoExt}`;
  return name.replace(/-index$/, "");
}

function getRegistryItemType(sourcePath: string) {
  if (sourcePath.endsWith(".css")) return "registry:ui";
  if (sourcePath.startsWith(REACT_UTILS_DIR)) return "registry:lib";
  if (sourcePath.startsWith(REACT_HOOKS_DIR)) return "registry:hook";
  if (sourcePath.startsWith(DATA_DIR)) return "registry:example";
  if (sourcePath.startsWith(LIB_DIR)) return "registry:ui";
  if (sourcePath.startsWith(EXAMPLES_DIR)) return "registry:example";
  return "registry:ui";
}

function getRegistryItemPath(sourcePath: string, itemName: string) {
  const type = getRegistryItemType(sourcePath);
  const filename = getRegistryItemFilename(sourcePath);
  if (type === "registry:lib") return `registry/lib/${filename}`;
  if (type === "registry:hook") return `registry/hook/${filename}`;
  if (type === "registry:ui") {
    return `registry/ui/${filename.replace("ak-", "")}`;
  }
  const exampleName = itemName.replace(/^[a-z-]+-(examples|components)-/, "");
  return `registry/examples/${exampleName}/${filename}`;
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
    const sources =
      "sources" in source ? source.sources : { [source.id]: source };
    for (const s of Object.values(sources)) {
      if (
        isLibSourcePath(s.id) &&
        (("name" in source && source.name !== getRegistryItemName(s.id)) ||
          ("id" in source && source.id !== s.id))
      ) {
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
    for (const utility of Object.values(source.utilities)) {
      for (const dep of utility.dependencies) {
        if (!dep.module) continue;
        if (dep.module === source.id) continue;
        dependencies.add(`${url.origin}/r/ak-${dep.module}.json`);
      }
    }
  } else {
    const sources =
      "sources" in source ? source.sources : { [source.id]: source };

    for (const [pkg, { content }] of Object.entries(sources)) {
      const styles = resolveDirectStyles(content);

      for (const style of styles) {
        if (!style.module) continue;
        dependencies.add(`${url.origin}/r/ak-${style.module}.json`);
      }

      getImportPaths(content).forEach((importPath) => {
        const absolutePath = importPath.startsWith(".")
          ? join(dirname(pkg), importPath)
          : importPath.replace("#app/", APP_DIR);

        if (!isLibSourcePath(absolutePath)) return;
        dependencies.add(
          `${url.origin}/r/${getRegistryItemName(absolutePath)}.json`,
        );
      });

      if (
        !isLibSourcePath(pkg) ||
        ("name" in source && source.name === getRegistryItemName(pkg)) ||
        ("id" in source && source.id === pkg)
      )
        continue;
      dependencies.add(`${url.origin}/r/${getRegistryItemName(pkg)}.json`);
    }
  }

  return Array.from(dependencies).sort();
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

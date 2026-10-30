/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { readdirSync } from "node:fs";
import type { Dirent } from "node:fs";
import fs from "node:fs/promises";
import {
  basename,
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
} from "node:path";
import { fileURLToPath } from "node:url";
import { invariant } from "@ariakit/utils";
import type { Loader } from "astro/loaders";
import type { LoaderContext } from "astro/loaders";
import { z } from "astro/zod";
import { getFrameworkByFilename, isFramework } from "./framework.ts";
import { isInDirectory, toFilePath, toPosixPath } from "./path.ts";
import type { PathInput } from "./path.ts";
import {
  getPreviewCodegenDir,
  getPreviewContentFile,
  writePreviewCodegen,
} from "./preview-codegen.ts";
import { FRAMEWORKS, FrameworkSchema } from "./schemas.ts";
import type { Framework } from "./schemas.ts";

export interface PreviewRootOptions {
  kind: string;
  dir: PathInput;
  metadataRequired: boolean;
  /**
   * Whether each preview in this root needs a `description` in its metadata.
   */
  descriptionRequired?: boolean;
  /**
   * A segment that starts the ids of the previews in this root, so they cannot
   * collide with the previews of a root that uses the same folder names.
   */
  idPrefix?: string;
}

export interface PreviewDiscoveryOptions {
  root?: PathInput;
  srcDir?: PathInput;
  roots: PreviewRootOptions[];
  metadataFileName?: string;
}

export interface ResolvedPreviewRoot {
  kind: string;
  dir: string;
  metadataRequired: boolean;
  descriptionRequired?: boolean;
  idPrefix?: string;
}

/**
 * How an embedded preview opens the popup of its example: `true` clicks its
 * trigger, and `"hover"` hovers it, for a tooltip or a hovercard.
 */
type PreviewOpen = boolean | "hover";

interface PreviewMetadata {
  title?: string;
  description?: string;
  fullscreen?: boolean;
  open?: PreviewOpen;
  compact?: boolean;
  frameworks?: Framework[];
}

const PREVIEW_METADATA_KEYS = [
  "title",
  "description",
  "fullscreen",
  "open",
  "compact",
  "frameworks",
] as const;

function isPreviewMetadataKey(key: string) {
  return PREVIEW_METADATA_KEYS.some((item) => item === key);
}

export interface DiscoveredPreview {
  id: string;
  title: string;
  source: string;
  frameworks: Framework[];
  entryFiles: Partial<Record<Framework, string>>;
  metadata: PreviewMetadata;
}

export const PreviewDataSchema = z.object({
  title: z.string(),
  description: z.string().optional(),
  fullscreen: z.boolean().optional(),
  open: z.union([z.boolean(), z.literal("hover")]).optional(),
  compact: z.boolean().optional(),
  frameworks: FrameworkSchema.array(),
  source: z.string(),
});

interface DiscoverRootContext {
  root: ResolvedPreviewRoot;
  previews: Map<string, DiscoveredPreview>;
}

function getDefaultSrcDir(options: PreviewDiscoveryOptions) {
  if (options.srcDir) {
    return options.srcDir;
  }
  if (options.root) {
    return new URL("./src/", new URL(`${toFilePath(options.root)}/`, "file:"));
  }
  return new URL("../", import.meta.url);
}

export function resolvePreviewRoots(options: PreviewDiscoveryOptions) {
  const srcDir = getDefaultSrcDir(options);
  return options.roots.map((root) => ({
    kind: root.kind,
    dir: toFilePath(root.dir, srcDir),
    metadataRequired: root.metadataRequired,
    descriptionRequired: root.descriptionRequired,
    idPrefix: root.idPrefix,
  }));
}

function getPreviewMetadataFileName(options: PreviewDiscoveryOptions) {
  return options.metadataFileName ?? "preview.json";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function parseFrameworks(value: unknown, id: string) {
  if (value === undefined) return undefined;
  invariant(Array.isArray(value), `Invalid frameworks metadata for ${id}`);
  const frameworks: Framework[] = [];
  for (const framework of value) {
    invariant(
      typeof framework === "string" && isFramework(framework),
      `Invalid framework metadata for ${id}`,
    );
    frameworks.push(framework);
  }
  return frameworks;
}

function parsePreviewMetadata(value: unknown, id: string) {
  invariant(isRecord(value), `Invalid preview metadata for ${id}`);
  for (const key of Object.keys(value)) {
    invariant(
      isPreviewMetadataKey(key),
      `Unknown preview metadata key "${key}" for ${id}`,
    );
  }
  const metadata: PreviewMetadata = {};
  const { title, description, fullscreen, open, compact } = value;
  if (title !== undefined) {
    invariant(typeof title === "string", `Invalid title metadata for ${id}`);
    metadata.title = title;
  }
  if (description !== undefined) {
    invariant(
      typeof description === "string",
      `Invalid description metadata for ${id}`,
    );
    metadata.description = description;
  }
  if (fullscreen !== undefined) {
    invariant(
      typeof fullscreen === "boolean",
      `Invalid fullscreen metadata for ${id}`,
    );
    metadata.fullscreen = fullscreen;
  }
  if (open !== undefined) {
    invariant(
      typeof open === "boolean" || open === "hover",
      `Invalid open metadata for ${id}`,
    );
    metadata.open = open;
  }
  if (compact !== undefined) {
    invariant(
      typeof compact === "boolean",
      `Invalid compact metadata for ${id}`,
    );
    metadata.compact = compact;
  }
  const frameworks = parseFrameworks(value.frameworks, id);
  if (frameworks) {
    metadata.frameworks = frameworks;
  }
  return metadata;
}

async function readPreviewMetadata(file: string, id: string) {
  let json: string;
  try {
    json = await fs.readFile(file, "utf8");
  } catch (error) {
    const code = error instanceof Error && "code" in error && error.code;
    if (code === "ENOENT") return undefined;
    throw error;
  }
  const parsed: unknown = JSON.parse(json);
  return parsePreviewMetadata(parsed, id);
}

function isDirectoryIgnored(name: string) {
  if (name.startsWith(".")) return true;
  return name === "node_modules";
}

export function isPreviewEntryFile(filename: string) {
  if (!filename.startsWith("index.")) return false;
  return !!getFrameworkByFilename(filename);
}

export function shouldRegeneratePreview(
  file: string,
  roots: ResolvedPreviewRoot[],
  metadataFileName = "preview.json",
) {
  const filename = basename(file);
  if (filename !== metadataFileName) {
    if (!isPreviewEntryFile(filename)) return false;
  }
  return roots.some((root) => isInDirectory(file, root.dir));
}

function sortFrameworks(frameworks: Iterable<Framework>) {
  const set = new Set(frameworks);
  return FRAMEWORKS.filter((framework) => set.has(framework));
}

function getPreviewEntryFiles(dir: string, entries: Dirent[]) {
  const entryFiles: Partial<Record<Framework, string>> = {};
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (!isPreviewEntryFile(entry.name)) continue;
    const framework = getFrameworkByFilename(entry.name);
    invariant(framework, `Invalid preview entry file: ${entry.name}`);
    invariant(
      !entryFiles[framework],
      `Duplicate ${framework} preview in ${dir}`,
    );
    entryFiles[framework] = join(dir, entry.name);
  }
  return entryFiles;
}

function getPreviewFrameworksFromEntries(dir: string, entries: Dirent[]) {
  const entryFiles = getPreviewEntryFiles(dir, entries);
  return sortFrameworks(Object.keys(entryFiles).filter(isFramework));
}

export async function getPreviewFrameworks(dir: string) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return getPreviewFrameworksFromEntries(dir, entries);
}

export function getPreviewFrameworksSync(dir: string) {
  const entries = readdirSync(dir, { withFileTypes: true });
  return getPreviewFrameworksFromEntries(dir, entries);
}

/**
 * Resolves the frameworks of the preview in `dir` like preview discovery does.
 * Metadata frameworks take precedence over entry files, so metadata-only
 * previews, such as Next.js examples, also have frameworks.
 */
export async function resolvePreviewFrameworks(dir: string, id: string) {
  const metadata = await readPreviewMetadata(join(dir, "preview.json"), id);
  if (metadata?.frameworks) return metadata.frameworks;
  return getPreviewFrameworks(dir);
}

function getFallbackTitle(dir: string) {
  return basename(dir);
}

function getPreviewId(root: ResolvedPreviewRoot, dir: string) {
  const id = toPosixPath(relative(root.dir, dir));
  // The root directory itself is not a preview, so it keeps the empty id.
  if (!id || !root.idPrefix) return id;
  return `${root.idPrefix}/${id}`;
}

/**
 * Returns the preview id of a directory in one of the preview roots, or
 * `undefined` when the directory is outside the roots or is a root itself.
 */
export function getPreviewIdFromDir(roots: ResolvedPreviewRoot[], dir: string) {
  for (const root of roots) {
    if (!isInDirectory(dir, root.dir)) continue;
    return getPreviewId(root, dir) || undefined;
  }
  return undefined;
}

/**
 * Returns the file that an import specifier points to when it is an absolute
 * path, an `#app/*` path in `srcDir`, or a path relative to the importer. A
 * package specifier has no file here. Query strings, such as `?source`, are
 * dropped.
 */
export function resolvePreviewModuleFile(
  id: string,
  importer: string | undefined,
  srcDir: string,
) {
  const specifier = id.split("?")[0] ?? id;
  if (isAbsolute(specifier)) return specifier;
  if (specifier.startsWith("#app/")) {
    return join(srcDir, specifier.slice("#app/".length));
  }
  if (!importer) return;
  if (!specifier.startsWith(".")) return;
  return resolve(dirname(importer), specifier);
}

interface AddPreviewParams {
  context: DiscoverRootContext;
  dir: string;
  entryFiles: Partial<Record<Framework, string>>;
  metadata?: PreviewMetadata;
}

function addPreview({
  context,
  dir,
  entryFiles,
  metadata = {},
}: AddPreviewParams) {
  const id = getPreviewId(context.root, dir);
  if (!id) return;
  const entryFrameworks = sortFrameworks(
    Object.keys(entryFiles).filter(isFramework),
  );
  const frameworks = metadata.frameworks ?? entryFrameworks;
  if (frameworks.length === 0) return;
  for (const framework of frameworks) {
    invariant(
      entryFrameworks.length === 0 || !!entryFiles[framework],
      `Preview "${id}" declares "${framework}" without an index.${framework} entry file`,
    );
  }
  const existing = context.previews.get(id);
  invariant(!existing, `Duplicate preview id: ${id}`);
  context.previews.set(id, {
    id,
    title: metadata.title ?? getFallbackTitle(dir),
    source: context.root.kind,
    frameworks,
    entryFiles,
    metadata,
  });
}

async function discoverRoot(
  context: DiscoverRootContext,
  dir = context.root.dir,
  metadataFileName = "preview.json",
) {
  let entries: Dirent[];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
  const entryFiles = getPreviewEntryFiles(dir, entries);
  let metadata: PreviewMetadata | undefined;
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    if (entry.name === metadataFileName) {
      metadata = await readPreviewMetadata(
        join(dir, entry.name),
        getPreviewId(context.root, dir),
      );
      continue;
    }
  }
  const hasEntryFiles = Object.keys(entryFiles).length > 0;
  const hasMetadataFrameworks = !!metadata?.frameworks?.length;
  const createsPreview = hasEntryFiles || hasMetadataFrameworks;
  invariant(
    !!metadata || !context.root.metadataRequired || !hasEntryFiles,
    `Missing ${metadataFileName} for ${getPreviewId(context.root, dir)}`,
  );
  invariant(
    !!metadata?.title || !context.root.metadataRequired || !createsPreview,
    `Missing title metadata for ${getPreviewId(context.root, dir)}`,
  );
  invariant(
    !!metadata?.description ||
      !context.root.descriptionRequired ||
      !createsPreview,
    `Missing description metadata for ${getPreviewId(context.root, dir)}`,
  );
  addPreview({ context, dir, entryFiles, metadata });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (isDirectoryIgnored(entry.name)) continue;
    await discoverRoot(context, join(dir, entry.name), metadataFileName);
  }
}

export async function discoverPreviews(options: PreviewDiscoveryOptions) {
  const roots = resolvePreviewRoots(options);
  const previews = new Map<string, DiscoveredPreview>();
  const metadataFileName = getPreviewMetadataFileName(options);
  for (const root of roots) {
    await discoverRoot({ root, previews }, root.dir, metadataFileName);
  }
  return [...previews.values()].sort((a, b) => a.id.localeCompare(b.id));
}

function getPreviewLoaderOptions(
  context: Pick<LoaderContext, "config">,
  options: PreviewDiscoveryOptions,
) {
  return {
    root: context.config.root,
    srcDir: context.config.srcDir,
    ...options,
  };
}

async function updatePreviewStore(
  context: LoaderContext,
  options: PreviewDiscoveryOptions,
) {
  const previewOptions = getPreviewLoaderOptions(context, options);
  const previews = await discoverPreviews(previewOptions);
  const codegenDir = getPreviewCodegenDir(context.config.root);
  const previewsDir = join(codegenDir, "previews");
  await writePreviewCodegen({ codegenDir, previews });
  context.store.clear();
  for (const preview of previews) {
    const rawData = {
      title: preview.title,
      description: preview.metadata.description,
      fullscreen: preview.metadata.fullscreen,
      open: preview.metadata.open,
      compact: preview.metadata.compact,
      frameworks: preview.frameworks,
      source: preview.source,
    };
    const data = await context.parseData({ id: preview.id, data: rawData });
    const hasEntryFiles = Object.keys(preview.entryFiles).length > 0;
    const contentFile = hasEntryFiles
      ? getPreviewContentFile(previewsDir, preview.id)
      : undefined;
    const filePath = contentFile
      ? toPosixPath(relative(fileURLToPath(context.config.root), contentFile))
      : undefined;
    if (filePath) {
      context.store.addModuleImport(filePath);
    }
    context.store.set({
      id: preview.id,
      data,
      digest: context.generateDigest({
        data: rawData,
        entryFiles: preview.entryFiles,
        id: preview.id,
      }),
      ...(filePath ? { deferredRender: true, filePath } : {}),
    });
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

function watchPreviews(
  context: LoaderContext,
  options: PreviewDiscoveryOptions,
) {
  if (!context.watcher) return;
  const previewOptions = getPreviewLoaderOptions(context, options);
  const roots = resolvePreviewRoots(previewOptions);
  const metadataFileName = getPreviewMetadataFileName(previewOptions);
  context.watcher.add(roots.map((root) => root.dir));
  let pendingReload = Promise.resolve();
  const queueReload = (file: string) => {
    if (!shouldRegeneratePreview(file, roots, metadataFileName)) return;
    const reload = async () => {
      await updatePreviewStore({ ...context, watcher: undefined }, options);
    };
    const result = pendingReload.then(reload, reload);
    pendingReload = result.catch(() => undefined);
    result.catch((error: unknown) => {
      context.logger.error(
        `Failed to reload ${file}: ${getErrorMessage(error)}`,
      );
    });
    return result;
  };
  context.watcher.on("add", queueReload);
  context.watcher.on("change", queueReload);
  context.watcher.on("unlink", queueReload);
}

export const previewLoader = Object.assign(
  function previewLoader(options: PreviewDiscoveryOptions) {
    return {
      name: "ariakit-preview-loader",
      async load(context: LoaderContext) {
        await updatePreviewStore(context, options);
        watchPreviews(context, options);
      },
    } satisfies Loader;
  },
  { schema: PreviewDataSchema },
);

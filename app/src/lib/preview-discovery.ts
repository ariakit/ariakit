/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { Dirent } from "node:fs";
import fs from "node:fs/promises";
import { basename, isAbsolute, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { invariant } from "@ariakit/utils";
import type { Loader } from "astro/loaders";
import { getFrameworkByFilename, isFramework } from "./frameworks.ts";
import { FRAMEWORKS } from "./schemas.ts";
import type { Framework } from "./schemas.ts";

type PathInput = string | URL;

export interface PreviewRootOptions {
  kind: string;
  dir: PathInput;
  metadataRequired?: boolean;
}

export interface PreviewDiscoveryOptions {
  root?: PathInput;
  srcDir?: PathInput;
  roots?: PreviewRootOptions[];
  metadataFileName?: string;
}

export interface ResolvedPreviewRoot {
  kind: string;
  dir: string;
  metadataRequired: boolean;
}

interface PreviewMetadata {
  title?: string;
  fullscreen?: boolean;
  frameworks?: Framework[];
}

const PREVIEW_METADATA_KEYS = ["title", "fullscreen", "frameworks"] as const;

function isPreviewMetadataKey(key: string) {
  return PREVIEW_METADATA_KEYS.some((item) => item === key);
}

export interface DiscoveredPreview {
  id: string;
  title: string;
  source: string;
  dir: string;
  relativeDir: string;
  frameworks: Framework[];
  entryFiles: Partial<Record<Framework, string>>;
  metadata: PreviewMetadata;
}

interface DiscoverRootContext {
  root: ResolvedPreviewRoot;
  previews: Map<string, DiscoveredPreview>;
}

function toPosixPath(path: string) {
  return path.replace(/\\/g, "/");
}

function toFilePath(path: PathInput, base?: PathInput): string {
  if (path instanceof URL) {
    return fileURLToPath(path);
  }
  if (path.startsWith("file:")) {
    return fileURLToPath(path);
  }
  if (isAbsolute(path)) {
    return path;
  }
  if (base) {
    return resolve(toFilePath(base), path);
  }
  return resolve(path);
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

export function resolvePreviewRoots(options: PreviewDiscoveryOptions = {}) {
  if (options.roots) {
    return options.roots.map((root) => ({
      kind: root.kind,
      dir: toFilePath(root.dir, options.srcDir ?? options.root),
      metadataRequired: root.metadataRequired ?? root.kind === "examples",
    }));
  }
  const srcDir = getDefaultSrcDir(options);
  return [
    {
      kind: "examples",
      dir: toFilePath("examples", srcDir),
      metadataRequired: true,
    },
    {
      kind: "sandbox",
      dir: toFilePath("sandbox", srcDir),
      metadataRequired: false,
    },
  ];
}

function getPreviewMetadataFileName(options: PreviewDiscoveryOptions = {}) {
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
  const { title, fullscreen } = value;
  if (title !== undefined) {
    invariant(typeof title === "string", `Invalid title metadata for ${id}`);
    metadata.title = title;
  }
  if (fullscreen !== undefined) {
    invariant(
      typeof fullscreen === "boolean",
      `Invalid fullscreen metadata for ${id}`,
    );
    metadata.fullscreen = fullscreen;
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

function isPreviewEntryFile(filename: string) {
  if (!filename.startsWith("index.")) return false;
  return !!getFrameworkByFilename(filename);
}

function sortFrameworks(frameworks: Iterable<Framework>) {
  const set = new Set(frameworks);
  return FRAMEWORKS.filter((framework) => set.has(framework));
}

function getFallbackTitle(dir: string) {
  return basename(dir);
}

function getPreviewId(root: ResolvedPreviewRoot, dir: string) {
  return toPosixPath(relative(root.dir, dir));
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
  const frameworks =
    metadata.frameworks ??
    sortFrameworks(Object.keys(entryFiles).filter(isFramework));
  if (frameworks.length === 0) return;
  const existing = context.previews.get(id);
  invariant(!existing, `Duplicate preview id: ${id}`);
  const relativeDir = `${context.root.kind}/${id}`;
  context.previews.set(id, {
    id,
    title: metadata.title ?? getFallbackTitle(dir),
    source: context.root.kind,
    dir,
    relativeDir,
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
  const entryFiles: Partial<Record<Framework, string>> = {};
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
    if (!isPreviewEntryFile(entry.name)) continue;
    const framework = getFrameworkByFilename(entry.name);
    invariant(framework, `Invalid preview entry file: ${entry.name}`);
    invariant(
      !entryFiles[framework],
      `Duplicate ${framework} preview in ${dir}`,
    );
    entryFiles[framework] = join(dir, entry.name);
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
  addPreview({ context, dir, entryFiles, metadata });
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (isDirectoryIgnored(entry.name)) continue;
    await discoverRoot(context, join(dir, entry.name), metadataFileName);
  }
}

export async function discoverPreviews(options: PreviewDiscoveryOptions = {}) {
  const roots = resolvePreviewRoots(options);
  const previews = new Map<string, DiscoveredPreview>();
  const metadataFileName = getPreviewMetadataFileName(options);
  for (const root of roots) {
    await discoverRoot({ root, previews }, root.dir, metadataFileName);
  }
  return [...previews.values()].sort((a, b) => a.id.localeCompare(b.id));
}

export function previewLoader(options: PreviewDiscoveryOptions = {}): Loader {
  return {
    name: "ariakit-preview-loader",
    async load(context) {
      const { config, store, watcher } = context;
      const previews = await discoverPreviews({
        root: config.root,
        srcDir: config.srcDir,
        ...options,
      });
      store.clear();
      for (const root of resolvePreviewRoots({
        root: config.root,
        srcDir: config.srcDir,
        ...options,
      })) {
        watcher?.add(root.dir);
      }
      for (const preview of previews) {
        const rawData = {
          title: preview.title,
          fullscreen: preview.metadata.fullscreen,
          frameworks: preview.frameworks,
          source: preview.source,
        };
        const data = await context.parseData({ id: preview.id, data: rawData });
        store.set({
          id: preview.id,
          data,
          digest: context.generateDigest({
            data: rawData,
            entryFiles: preview.entryFiles,
            id: preview.id,
          }),
        });
      }
    },
  };
}

import type { Dirent } from "node:fs";
/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import fs from "node:fs/promises";
import { isAbsolute, join, relative, resolve } from "node:path";
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
}

export interface PreviewDiscoveryOptions {
  root?: PathInput;
  srcDir?: PathInput;
  roots?: PreviewRootOptions[];
  metadataFile?: PathInput;
}

export interface ResolvedPreviewRoot {
  kind: string;
  dir: string;
}

interface PreviewMetadata {
  title?: string;
  fullscreen?: boolean;
  frameworks?: Framework[];
  source?: string;
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
  metadata: Record<string, PreviewMetadata>;
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
    }));
  }
  const srcDir = getDefaultSrcDir(options);
  return [
    { kind: "examples", dir: toFilePath("examples", srcDir) },
    { kind: "sandbox", dir: toFilePath("sandbox", srcDir) },
  ];
}

export function resolvePreviewMetadataFile(
  options: PreviewDiscoveryOptions = {},
) {
  if (!options.metadataFile) return undefined;
  return toFilePath(options.metadataFile, options.srcDir ?? options.root);
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
  const metadata: PreviewMetadata = {};
  const { title, fullscreen, source } = value;
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
  if (source !== undefined) {
    invariant(typeof source === "string", `Invalid source metadata for ${id}`);
    metadata.source = source;
  }
  const frameworks = parseFrameworks(value.frameworks, id);
  if (frameworks) {
    metadata.frameworks = frameworks;
  }
  return metadata;
}

async function readPreviewMetadata(options: PreviewDiscoveryOptions) {
  const metadataFile = resolvePreviewMetadataFile(options);
  if (!metadataFile) return {};
  let json: string;
  try {
    json = await fs.readFile(metadataFile, "utf8");
  } catch (error) {
    const code = error instanceof Error && "code" in error && error.code;
    if (code === "ENOENT") return {};
    throw error;
  }
  const parsed: unknown = JSON.parse(json);
  invariant(isRecord(parsed), "Invalid preview metadata file");
  const metadata: Record<string, PreviewMetadata> = {};
  for (const [id, value] of Object.entries(parsed)) {
    metadata[id] = parsePreviewMetadata(value, id);
  }
  return metadata;
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

function getFallbackTitle(id: string) {
  const segments = id.split("/");
  const segment = segments.at(-1) || id;
  return segment
    .split("-")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function getPreviewId(root: ResolvedPreviewRoot, dir: string) {
  return toPosixPath(relative(root.dir, dir));
}

function addPreview(
  context: DiscoverRootContext,
  dir: string,
  entryFiles: Partial<Record<Framework, string>>,
) {
  const id = getPreviewId(context.root, dir);
  if (!id) return;
  const metadata = context.metadata[id] ?? {};
  const frameworks =
    metadata.frameworks ??
    sortFrameworks(Object.keys(entryFiles).filter(isFramework));
  if (frameworks.length === 0) return;
  const existing = context.previews.get(id);
  invariant(!existing, `Duplicate preview id: ${id}`);
  const relativeDir = `${context.root.kind}/${id}`;
  context.previews.set(id, {
    id,
    title: metadata.title ?? getFallbackTitle(id),
    source: metadata.source ?? context.root.kind,
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
) {
  let entries: Dirent[];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return;
  }
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
  addPreview(context, dir, entryFiles);
  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    if (isDirectoryIgnored(entry.name)) continue;
    await discoverRoot(context, join(dir, entry.name));
  }
}

async function findMetadataRoot(
  id: string,
  metadata: PreviewMetadata,
  roots: ResolvedPreviewRoot[],
) {
  if (metadata.source) {
    const root = roots.find((item) => item.kind === metadata.source);
    invariant(root, `Unknown preview metadata source: ${metadata.source}`);
    return root;
  }
  for (const root of roots) {
    const dir = join(root.dir, id);
    try {
      const stat = await fs.stat(dir);
      if (stat.isDirectory()) return root;
    } catch {}
  }
  return roots[0];
}

async function addMetadataOnlyPreviews(
  previews: Map<string, DiscoveredPreview>,
  metadata: Record<string, PreviewMetadata>,
  roots: ResolvedPreviewRoot[],
) {
  for (const [id, value] of Object.entries(metadata)) {
    if (previews.has(id)) continue;
    if (!value.frameworks) continue;
    const root = await findMetadataRoot(id, value, roots);
    invariant(root, "Preview roots are required");
    const dir = join(root.dir, id);
    previews.set(id, {
      id,
      title: value.title ?? getFallbackTitle(id),
      source: value.source ?? root.kind,
      dir,
      relativeDir: `${root.kind}/${id}`,
      frameworks: value.frameworks,
      entryFiles: {},
      metadata: value,
    });
  }
}

export async function discoverPreviews(options: PreviewDiscoveryOptions = {}) {
  const roots = resolvePreviewRoots(options);
  const metadata = await readPreviewMetadata(options);
  const previews = new Map<string, DiscoveredPreview>();
  for (const root of roots) {
    await discoverRoot({ root, metadata, previews });
  }
  await addMetadataOnlyPreviews(previews, metadata, roots);
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
      const metadataFile = resolvePreviewMetadataFile({
        root: config.root,
        srcDir: config.srcDir,
        ...options,
      });
      if (metadataFile) {
        watcher?.add(metadataFile);
      }
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

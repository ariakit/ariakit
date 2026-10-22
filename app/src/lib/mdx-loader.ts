/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { basename, dirname } from "node:path";
import { invariant } from "@ariakit/utils";
import { glob } from "astro/loaders";
import type { Loader, LoaderContext } from "astro/loaders";
import type { z } from "astro/zod";
import { isInDirectory, toFilePath } from "./path.ts";
import {
  isPreviewEntryFile,
  resolvePreviewFrameworks,
} from "./preview-discovery.ts";
import { FrameworkSchema } from "./schemas.ts";

interface GenerateIdOptions {
  entry: string;
}

interface MdxLoaderOptions {
  base: string | URL;
}

interface InferredFrameworksLoaderParams {
  base: string | URL;
  generateId?: (options: GenerateIdOptions) => string;
  name: string;
  pattern: string;
}

interface WatchFrameworkEntryFilesParams {
  base: string | URL;
  context: LoaderContext;
  loader: Loader;
  parseData: LoaderContext["parseData"];
}

const PREVIEW_METADATA_FILE = "preview.json";

/**
 * Checks whether a file decides the frameworks of a page: its entry files, or
 * the metadata that lists them.
 */
function isFrameworkSourceFile(filename: string) {
  if (filename === PREVIEW_METADATA_FILE) return true;
  return isPreviewEntryFile(filename);
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

function watchFrameworkEntryFiles({
  base,
  context,
  loader,
  parseData,
}: WatchFrameworkEntryFilesParams) {
  if (!context.watcher) return;
  const basePath = toFilePath(base, context.config.root);
  context.watcher.add(basePath);
  let pendingReload = Promise.resolve();
  const queueReload = (file: string) => {
    if (!isInDirectory(file, basePath)) return;
    if (!isFrameworkSourceFile(basename(file))) return;
    const reload = async () => {
      context.store.clear();
      await loader.load({ ...context, parseData, watcher: undefined });
    };
    const result = pendingReload.then(reload, reload);
    pendingReload = result.catch(() => undefined);
    result.catch((error: unknown) => {
      context.logger.error(
        `Failed to reload ${file}: ${getErrorMessage(error)}`,
      );
    });
  };
  context.watcher.on("add", queueReload);
  context.watcher.on("unlink", queueReload);
  // Editing an entry file keeps its framework, but editing preview.json can
  // change the frameworks of a page without entry files.
  context.watcher.on("change", (file) => {
    if (basename(file) !== PREVIEW_METADATA_FILE) return;
    queueReload(file);
  });
}

function withInferredFrameworksSchema<TShape extends z.ZodRawShape>(
  schema: z.ZodObject<TShape>,
) {
  return schema.extend({
    frameworks: FrameworkSchema.array(),
  });
}

function withInferredFrameworks({
  base,
  generateId,
  name,
  pattern,
}: InferredFrameworksLoaderParams) {
  const loader = glob({ base, generateId, pattern });
  return {
    ...loader,
    name,
    async load(context: LoaderContext) {
      const parseData: LoaderContext["parseData"] = async (options) => {
        const { filePath } = options;
        invariant(filePath, `Cannot infer frameworks for ${options.id}`);
        const dir = dirname(filePath);
        const inferredFrameworks = await resolvePreviewFrameworks(
          dir,
          options.id,
        );
        invariant(
          inferredFrameworks.length > 0,
          `Missing framework entry file for ${options.id}`,
        );
        const data = {
          ...options.data,
          frameworks: inferredFrameworks,
        };
        return context.parseData({ ...options, data });
      };
      await loader.load({ ...context, parseData });
      watchFrameworkEntryFiles({ base, context, loader, parseData });
    },
  } satisfies Loader;
}

export const recipeLoader = Object.assign(
  function recipeLoader(options: MdxLoaderOptions) {
    return withInferredFrameworks({
      ...options,
      name: "ariakit-recipe-loader",
      pattern: "*/index.mdx",
    });
  },
  { schema: withInferredFrameworksSchema },
);

export const componentLoader = Object.assign(
  function componentLoader(options: MdxLoaderOptions) {
    return withInferredFrameworks({
      ...options,
      name: "ariakit-component-loader",
      pattern: "*/index.mdx",
    });
  },
  { schema: withInferredFrameworksSchema },
);

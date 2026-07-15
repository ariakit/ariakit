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
import { isInDirectory, toFilePath } from "./paths.ts";
import {
  getPreviewFrameworks,
  isPreviewEntryFile,
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
    if (!isPreviewEntryFile(basename(file))) return;
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
        const inferredFrameworks = await getPreviewFrameworks(dir);
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

export const exampleLoader = Object.assign(
  function exampleLoader(options: MdxLoaderOptions) {
    return withInferredFrameworks({
      ...options,
      name: "ariakit-example-loader",
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
      pattern: "*/_component/index.mdx",
      generateId(options) {
        const [id] = options.entry.split("/");
        invariant(id, "Component must have an id");
        return id;
      },
    });
  },
  { schema: withInferredFrameworksSchema },
);

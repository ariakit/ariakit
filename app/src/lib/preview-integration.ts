/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import {
  basename,
  dirname,
  isAbsolute,
  join,
  relative,
  resolve,
} from "node:path";
import { fileURLToPath } from "node:url";
import type { AstroConfig, AstroIntegration } from "astro";
import type { Plugin } from "vite";
import {
  getPreviewFile,
  setPreviewCodegenDir,
  toPosixPath,
  writePreviewCodegen,
} from "./preview-codegen.ts";
import {
  discoverPreviews,
  isPreviewEntryFile,
  resolvePreviewRoots,
} from "./preview-discovery.ts";
import type { PreviewDiscoveryOptions } from "./preview-discovery.ts";

interface PreviewIntegrationParams {
  config: AstroConfig;
  codegenDir: string;
  options: PreviewDiscoveryOptions;
}

async function generatePreviewCodegen({
  config,
  codegenDir,
  options,
}: PreviewIntegrationParams) {
  const previews = await discoverPreviews({
    root: config.root,
    srcDir: config.srcDir,
    ...options,
  });
  return writePreviewCodegen({ codegenDir, previews });
}

function isInDirectory(file: string, dir: string) {
  const relativePath = relative(dir, file);
  return (
    relativePath === "" ||
    (!!relativePath &&
      !relativePath.startsWith("..") &&
      !isAbsolute(relativePath))
  );
}

export function shouldRegeneratePreview(
  file: string,
  roots: ReturnType<typeof resolvePreviewRoots>,
  metadataFileName = "preview.json",
) {
  const filename = basename(file);
  if (filename !== metadataFileName) {
    if (!isPreviewEntryFile(filename)) return false;
  }
  return roots.some((root) => isInDirectory(file, root.dir));
}

function shouldRegenerate(file: string, params: PreviewIntegrationParams) {
  const roots = resolvePreviewRoots({
    root: params.config.root,
    srcDir: params.config.srcDir,
    ...params.options,
  });
  return shouldRegeneratePreview(file, roots, params.options.metadataFileName);
}

function getPreviewImportId(file: string, params: PreviewIntegrationParams) {
  const roots = resolvePreviewRoots({
    root: params.config.root,
    srcDir: params.config.srcDir,
    ...params.options,
  });
  for (const root of roots) {
    if (!isInDirectory(file, root.dir)) continue;
    const id = toPosixPath(relative(root.dir, dirname(file)));
    if (!id) return undefined;
    return id;
  }
  return undefined;
}

function resolvePreviewImport(
  id: string,
  importer: string | undefined,
  params: PreviewIntegrationParams,
) {
  const specifier = id.split("?")[0] ?? id;
  if (!specifier.endsWith("/preview.astro")) return undefined;
  const file = isAbsolute(specifier)
    ? specifier
    : specifier.startsWith("#app/")
      ? join(
          fileURLToPath(params.config.srcDir),
          specifier.slice("#app/".length),
        )
      : importer
        ? resolve(dirname(importer), specifier)
        : undefined;
  if (!file) return undefined;
  const previewId = getPreviewImportId(file, params);
  if (!previewId) return undefined;
  return getPreviewFile(join(params.codegenDir, "previews"), previewId);
}

function previewCodegenPlugin(params: PreviewIntegrationParams): Plugin {
  let pendingRegeneration = Promise.resolve();
  const regenerate = async () => {
    const result = await generatePreviewCodegen(params);
    return result.changed;
  };
  const queueRegeneration = () => {
    const result = pendingRegeneration.then(regenerate, regenerate);
    pendingRegeneration = result.then(
      () => undefined,
      () => undefined,
    );
    return result;
  };
  return {
    name: "vite-plugin-ariakit-previews",
    resolveId(id, importer) {
      return resolvePreviewImport(id, importer, params);
    },
    configureServer(server) {
      const roots = resolvePreviewRoots({
        root: params.config.root,
        srcDir: params.config.srcDir,
        ...params.options,
      });
      server.watcher.add(roots.map((root) => root.dir));
      const handleChange = async (file: string) => {
        if (!shouldRegenerate(file, params)) return;
        const changed = await queueRegeneration();
        if (changed) {
          server.ws.send({ type: "full-reload" });
        }
      };
      server.watcher.on("add", handleChange);
      server.watcher.on("change", handleChange);
      server.watcher.on("unlink", handleChange);
    },
  };
}

export function previewIntegration(
  options: PreviewDiscoveryOptions,
): AstroIntegration {
  return {
    name: "ariakit-previews",
    hooks: {
      "astro:config:setup": async ({
        addWatchFile,
        config,
        createCodegenDir,
        updateConfig,
      }) => {
        const codegenDir = fileURLToPath(createCodegenDir());
        setPreviewCodegenDir(config.root, codegenDir);
        const params = { config, codegenDir, options };
        await generatePreviewCodegen(params);
        for (const root of resolvePreviewRoots({
          root: config.root,
          srcDir: config.srcDir,
          ...options,
        })) {
          addWatchFile(root.dir);
        }
        updateConfig({
          vite: {
            plugins: [previewCodegenPlugin(params)],
          },
        });
      },
    },
  };
}

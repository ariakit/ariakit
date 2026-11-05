/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { dirname } from "node:path";
import { highlight } from "@ariakit/ui/utils/highlight.server";
import type { APIRoute, GetStaticPaths } from "astro";
import { getCollection } from "astro:content";
import type { LazyFile } from "#app/lib/code-files.ts";
import { previewConfig } from "#app/lib/preview-config.ts";
import {
  getPreviewIdFromDir,
  resolvePreviewRoots,
} from "#app/lib/preview-discovery.ts";

interface ServerModule {
  lazyFiles?: Record<string, LazyFile>;
}

interface Props {
  file: LazyFile;
}

// Writes one JSON file for each lazy file of a preview at build time, so an
// example can load it on demand without Shiki in the browser or in the Worker.
const serverModules = import.meta.glob<ServerModule>(
  "/src/{recipes,component-docs,sandbox}/**/index.server.ts",
  { eager: true },
);

export const getStaticPaths = (async () => {
  const previews = new Set(
    (await getCollection("previews")).map((entry) => entry.id),
  );
  // Glob keys start at the app root, so the roots resolve against /src/ too.
  const roots = resolvePreviewRoots({ ...previewConfig, srcDir: "/src/" });
  return Object.entries(serverModules).flatMap(([path, module]) => {
    const id = getPreviewIdFromDir(roots, dirname(path));
    if (!id || !previews.has(id)) {
      throw new Error(`${path} is not in a preview folder`);
    }
    return Object.entries(module.lazyFiles ?? {}).map(([name, file]) => {
      // With the route path, this gives the URL that getCodeFileUrl returns.
      return { params: { file: `${id}/${name}` }, props: { file } };
    });
  });
}) satisfies GetStaticPaths;

export const GET: APIRoute<Props> = ({ props }) => {
  return Response.json(highlight(props.file.code, props.file.lang));
};

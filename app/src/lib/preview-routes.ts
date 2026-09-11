/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { Framework } from "./schemas.ts";

// Keep this module free of runtime imports. Routed previews import it in client
// code to build their links, and `preview-config.ts` pulls in `astro/zod`.

interface GetPreviewPathParams {
  framework: Framework;
  id: string;
  route?: string;
}

/**
 * Returns the `[...preview]` route parameter, with no leading or trailing
 * slash, such as `astro/previews/ariakit-ui/button`.
 */
export function getPreviewPath({ framework, id, route }: GetPreviewPathParams) {
  const path = `${framework}/previews/${id}`;
  if (!route) return path;
  return `${path}/${route}`;
}

interface PreviewPathsEntry {
  id: string;
  data: { frameworks: Framework[]; routes?: string[] };
}

/** Lists the index and every declared route of a preview, per framework. */
export function getPreviewPaths(entry: PreviewPathsEntry) {
  const routes = [undefined, ...(entry.data.routes ?? [])];
  return entry.data.frameworks.flatMap((framework) =>
    routes.map((route) => ({
      framework,
      route,
      path: getPreviewPath({ framework, id: entry.id, route }),
    })),
  );
}

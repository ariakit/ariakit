/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { PreviewKind } from "./preview-config.ts";
import { SANDBOX_PREVIEW_KIND } from "./preview-config.ts";
import type { Framework } from "./schemas.ts";

interface PreviewIndexEntry {
  id: string;
  data: {
    frameworks: Framework[];
    source: PreviewKind;
  };
}

export function getPreviewIndexPaths(entries: PreviewIndexEntry[]) {
  return entries
    .filter((entry) => entry.data.source !== SANDBOX_PREVIEW_KIND)
    .flatMap((entry) =>
      entry.data.frameworks.map(
        (framework) => `/${framework}/previews/${entry.id}`,
      ),
    );
}

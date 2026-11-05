/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { HighlightLanguage } from "@ariakit/ui/utils/highlight.server";

/**
 * A file that an example loads on demand. The server file of a preview exports
 * these as `lazyFiles`, keyed by file name, and the build writes the
 * highlighted result of each one to a JSON file.
 */
export interface LazyFile {
  lang: HighlightLanguage;
  code: string;
}

/** What the `load` function in the server file of a preview receives. */
export interface PreviewLoadContext {
  /**
   * Returns the URL of the JSON file that the build writes for a file in
   * `lazyFiles`.
   */
  getFileUrl: (name: string) => string;
}

/**
 * Returns the URL of the JSON file that the build writes for a lazy file of a
 * preview. The code files route answers this URL.
 */
function getCodeFileUrl(previewId: string, name: string) {
  return `/code-files/${previewId}/${name}.json`;
}

/** Returns the load context of the preview with this id. */
export function getPreviewLoadContext(previewId: string): PreviewLoadContext {
  return { getFileUrl: (name) => getCodeFileUrl(previewId, name) };
}

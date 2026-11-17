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
import type { FileIconData } from "#app/recipes/code-block/file-icons.ts";
import type { Framework } from "./schemas.ts";

const languagesByExtension: Record<string, HighlightLanguage> = {
  css: "css",
  html: "html",
  js: "js",
  json: "json",
  jsx: "jsx",
  ts: "ts",
  tsx: "tsx",
};

/**
 * A source file of a preview that the code dialog of its card loads when its
 * tab shows.
 */
export interface PreviewCodeFile {
  /** The path of the file in the source, such as `index.tsx`. */
  name: string;
  /** The URL of the partial page with the highlighted lines of the file. */
  url: string;
  /** The number of lines, so the placeholder can take the final height. */
  lines: number;
  /** The icon of the file tab, from `getFileIcon` on the server. */
  icon?: FileIconData;
}

export interface GetPreviewCodeFileUrlParams {
  framework: Framework;
  /** The name of the source, which is the preview id for most previews. */
  sourceName: string;
  /** The path of the file in the source, such as `index.tsx`. */
  fileName: string;
}

/**
 * Returns the URL of the partial page with the highlighted lines of a source
 * file. A `files` segment separates the source name from the file path, so the
 * file `b/c.tsx` of the source `a` and the file `c.tsx` of the source `a/b` get
 * different URLs.
 */
export function getPreviewCodeFileUrl({
  framework,
  sourceName,
  fileName,
}: GetPreviewCodeFileUrlParams) {
  return `/partials/${framework}/previews/${sourceName}/files/${fileName}/`;
}

/**
 * Returns the language that `highlight` uses for a file. A file without a
 * grammar shows as plain text.
 */
export function getPreviewCodeLanguage(fileName: string): HighlightLanguage {
  const extension = fileName.split(".").pop();
  if (!extension) return "text";
  if (!Object.hasOwn(languagesByExtension, extension)) return "text";
  return languagesByExtension[extension] ?? "text";
}

/**
 * Returns the code of a file as it shows, without the final line break, so the
 * code doesn't end with an empty line.
 */
export function getPreviewCode(content: string) {
  return content.replace(/\n+$/, "");
}

/** Returns the number of lines of a file as it shows. */
export function getPreviewCodeLines(content: string) {
  return getPreviewCode(content).split("\n").length;
}

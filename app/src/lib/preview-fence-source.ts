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
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import type { AstroIntegration } from "astro";
import type { Plugin } from "vite";
import { isInDirectory, toPosixPath } from "./path.ts";
import { writeFileIfChanged } from "./preview-codegen.ts";
import { isPreviewFence } from "./remark-preview-fence.ts";

/**
 * The name of the generated file, in the codegen directory of the integration.
 * The `@source` rule in `app/src/styles/base.css` has the path of this file.
 */
export const PREVIEW_FENCE_SOURCE_FILE = "preview-fences.html";

// A fence line: the indentation, block quote markers, and list markers of its
// containers, three or more backticks or tildes, and the info string.
const FENCE_PATTERN = /^(?:[\s>]|[-*+]\s|\d+[.)]\s)*(`{3,}|~{3,})(.*)$/;

// The first word of an info string is the language. The rest is the meta.
const INFO_PATTERN = /^(\S*)\s*(.*)$/;

interface FenceLine {
  marker: string;
  info: string;
}

function parseFenceLine(line: string): FenceLine | undefined {
  const [, marker, info = ""] = FENCE_PATTERN.exec(line) ?? [];
  if (!marker) return;
  return { marker, info: info.trim() };
}

function opensPreviewFence(line: FenceLine) {
  const [, lang, meta] = INFO_PATTERN.exec(line.info) ?? [];
  return isPreviewFence({ lang, meta });
}

// A fence closes at a line with the same character, at least as many of it as
// the opening line, and no info string.
function closesFence(line: FenceLine, openMarker: string) {
  if (line.info) return false;
  if (!line.marker.startsWith(openMarker.charAt(0))) return false;
  return line.marker.length >= openMarker.length;
}

/**
 * Returns the markup of the `html preview` code fences in the content of an MDX
 * file, which `remarkPreviewFences` renders as live examples. The markup lines
 * keep the indentation and block quote markers of their containers.
 *
 * This is a line scan, not the MDX parser, so it can take other text for a
 * fence. A missed fence is a live example without its utilities, and extra
 * markup is only a few unused rules. So the scan tracks only the preview
 * fences, and an `html preview` line opens one even inside another fence, such
 * as a sample of the syntax.
 */
export function getPreviewFenceMarkup(content: string) {
  const lines: string[] = [];
  // The marker of the open preview fence.
  let openMarker: string | undefined;
  for (const line of content.split(/\r?\n/)) {
    const fenceLine = parseFenceLine(line);
    if (openMarker) {
      if (fenceLine && closesFence(fenceLine, openMarker)) {
        openMarker = undefined;
      } else {
        lines.push(line);
      }
      continue;
    }
    if (!fenceLine) continue;
    if (!opensPreviewFence(fenceLine)) continue;
    openMarker = fenceLine.marker;
  }
  return lines.join("\n");
}

export interface PreviewFenceSourceParams {
  /** The directory with the MDX files whose text Tailwind does not scan. */
  dir: string;
  /** The generated file that Tailwind scans. */
  file: string;
}

/**
 * Writes the markup of the `html preview` code fences of the MDX files in a
 * directory to one file, and returns whether the file changed. Tailwind scans
 * this file instead of the MDX files. A Styles page names many utilities in its
 * text and code samples, and Tailwind would compile each one into the site CSS,
 * though the page renders only the live examples.
 */
export async function writePreviewFenceSource({
  dir,
  file,
}: PreviewFenceSourceParams) {
  const paths = await Array.fromAsync(fs.glob("**/*.mdx", { cwd: dir }));
  const sections: string[] = [];
  for (const path of paths.sort()) {
    const content = await fs.readFile(join(dir, path), "utf8");
    const markup = getPreviewFenceMarkup(content);
    if (!markup) continue;
    sections.push(`<!-- ${toPosixPath(path)} -->\n${markup}\n`);
  }
  return writeFileIfChanged(file, sections.join("\n"));
}

interface PreviewFenceSourceWatcher {
  on(
    event: "add" | "change" | "unlink",
    listener: (file: string) => void,
  ): unknown;
}

export interface WatchPreviewFenceSourceParams extends PreviewFenceSourceParams {
  /** The file watcher of the dev server. */
  watcher: PreviewFenceSourceWatcher;
  /** Receives the error of a failed write. */
  onError: (error: unknown) => void;
}

/**
 * Writes the source again when an MDX file in the directory changes. Tailwind
 * watches the generated file, so the dev server only has to write it.
 */
export function watchPreviewFenceSource({
  watcher,
  onError,
  ...params
}: WatchPreviewFenceSourceParams) {
  let pendingWrite = Promise.resolve();
  // A write can fail, for example when a branch switch removes a file during
  // the scan. The error must not reject the chain, because nothing handles that
  // rejection. The next change writes the source again.
  const write = async () => {
    try {
      await writePreviewFenceSource(params);
    } catch (error) {
      onError(error);
    }
  };
  const handleChange = (file: string) => {
    if (!file.endsWith(".mdx")) return;
    if (!isInDirectory(file, params.dir)) return;
    // The writes run in order, so the last change wins.
    pendingWrite = pendingWrite.then(write);
  };
  watcher.on("add", handleChange);
  watcher.on("change", handleChange);
  watcher.on("unlink", handleChange);
}

function previewFenceSourcePlugin(params: PreviewFenceSourceParams): Plugin {
  return {
    name: "vite-plugin-ariakit-preview-fences",
    configureServer(server) {
      watchPreviewFenceSource({
        ...params,
        watcher: server.watcher,
        onError: (error) => {
          server.config.logger.error(
            `Failed to write the preview fence source: ${String(error)}`,
          );
        },
      });
    },
  };
}

interface PreviewFenceSourceOptions {
  /**
   * The directory with the MDX files, relative to the source directory. The
   * `@source not` rule in `app/src/styles/base.css` excludes the same files.
   */
  dir: string;
}

/**
 * Generates the Tailwind source of the `html preview` code fences before the
 * build starts, and keeps it up to date on the dev server.
 */
export function previewFenceSourceIntegration({
  dir,
}: PreviewFenceSourceOptions): AstroIntegration {
  return {
    name: "ariakit-preview-fences",
    hooks: {
      "astro:config:setup": async ({
        config,
        createCodegenDir,
        updateConfig,
      }) => {
        const params = {
          dir: join(fileURLToPath(config.srcDir), dir),
          file: join(
            fileURLToPath(createCodegenDir()),
            PREVIEW_FENCE_SOURCE_FILE,
          ),
        };
        await writePreviewFenceSource(params);
        updateConfig({
          vite: {
            plugins: [previewFenceSourcePlugin(params)],
          },
        });
      },
    },
  };
}

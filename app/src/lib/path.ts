/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export type PathInput = string | URL;

/**
 * Normalizes path separators to posix style.
 */
export function toPosixPath(path: string) {
  return path.replace(/\\/g, "/");
}

/**
 * Converts a string path or file URL to an absolute file path.
 */
export function toFilePath(path: PathInput, base?: PathInput): string {
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

/**
 * Returns whether a path matches a directory or lives inside it.
 */
export function isInDirectory(file: string, dir: string) {
  const relativePath = relative(dir, file);
  return (
    relativePath === "" ||
    (!!relativePath &&
      !relativePath.startsWith("..") &&
      !isAbsolute(relativePath))
  );
}

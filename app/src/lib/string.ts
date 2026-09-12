/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import kebabCase from "lodash-es/kebabCase.js";

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function trimLeft(str: string, chars: string) {
  return str.replace(new RegExp(`^[${chars}]+`), "");
}

export function trimRight(str: string, chars: string) {
  return str.replace(new RegExp(`[${chars}]+$`), "");
}

export function trim(str: string, chars: string) {
  return trimLeft(trimRight(str, chars), chars);
}

export function generateId(prefix = "ak-") {
  return `${prefix}${Math.random().toString(36).substring(2, 10)}`;
}

export function slugify(str: string) {
  return kebabCase(str);
}

/**
 * Removes the blank lines at the start and the end of a string and the
 * indentation that all its other non-blank lines share, so an indented template
 * literal reads as if it were written at the first column.
 */
export function dedent(str: string) {
  const lines = str
    .replace(/^\s*\n/, "")
    .trimEnd()
    .split("\n");
  let indent = Number.POSITIVE_INFINITY;
  for (const line of lines) {
    if (!line.trim()) continue;
    const lineIndent = line.length - line.trimStart().length;
    indent = Math.min(indent, lineIndent);
  }
  if (indent === Number.POSITIVE_INFINITY) return "";
  return lines.map((line) => line.slice(indent)).join("\n");
}

/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

/**
 * Style token helpers shared by the runtime resolver and styles.json builder.
 *
 * This module must not import styles.json, directly or indirectly. The builder
 * generates that file and should not load its own output.
 */

export function isWildcard(name: string): boolean {
  return name.includes("*");
}

function escapeRegexSpecialChars(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Builds a regular expression from a wildcard pattern.
 */
export function toRegexFromWildcard(pattern: string) {
  let regexBody = "";
  for (let i = 0; i < pattern.length; i++) {
    const char = pattern.charAt(i);
    regexBody += char === "*" ? ".*" : escapeRegexSpecialChars(char);
  }
  return new RegExp(`^${regexBody}$`);
}

/**
 * Splits a class token on top-level colon separators.
 */
export function splitVariantSegments(token: string) {
  const segments: string[] = [];
  let start = 0;
  let bracketDepth = 0;
  let parenDepth = 0;
  for (let i = 0; i < token.length; i++) {
    const char = token.charAt(i);
    if (char === "[") {
      bracketDepth++;
    } else if (char === "]") {
      bracketDepth = Math.max(0, bracketDepth - 1);
    } else if (char === "(") {
      parenDepth++;
    } else if (char === ")") {
      parenDepth = Math.max(0, parenDepth - 1);
    } else if (char === ":" && bracketDepth === 0 && parenDepth === 0) {
      segments.push(token.slice(start, i));
      start = i + 1;
    }
  }
  segments.push(token.slice(start));
  return segments;
}

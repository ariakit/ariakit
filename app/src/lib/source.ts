/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

// ============================================================================
// Regex Patterns
// ============================================================================

// Shared quoted path fragment to capture module specifiers and preserve quote
// type. Supports single quotes, double quotes, and template literals (without
// interpolation).
const PATH_QUOTED = String.raw`(?:'(?<single>[^']+)'|"(?<double>[^"]+)"|\`(?<template>(?:[^\`$]|\$(?!\{))+?)\`)`;
const FROM_CLAUSE = String.raw`\s+from\s+${PATH_QUOTED}`;
const IMPORT_ATTRIBUTES = String.raw`(?<attributes>\s+(?:with|assert)\s+\{[\s\S]*?\})?`;

// Import patterns
const IMPORT_SIDE_EFFECT = new RegExp(
  String.raw`import\s+${PATH_QUOTED}${IMPORT_ATTRIBUTES}[\t ]*;?`,
  "g",
);
const IMPORT_NAMED = new RegExp(
  String.raw`import\s+(?!type\b)\{[\s\S]*?\}${FROM_CLAUSE}${IMPORT_ATTRIBUTES}[\t ]*;?`,
  "g",
);
const IMPORT_FROM_ANY = new RegExp(
  String.raw`import\s+(?!type\b)[^;]*?${FROM_CLAUSE}${IMPORT_ATTRIBUTES}[\t ]*;?`,
  "g",
);
const IMPORT_TYPE_NAMED = new RegExp(
  String.raw`import\s+type\s+\{[\s\S]*?\}${FROM_CLAUSE}${IMPORT_ATTRIBUTES}[\t ]*;?`,
  "g",
);
const IMPORT_TYPE_NAMESPACE = new RegExp(
  String.raw`import\s+type\s+\*\s+as\s+[^;]*?${FROM_CLAUSE}${IMPORT_ATTRIBUTES}[\t ]*;?`,
  "g",
);
const IMPORT_DYNAMIC = new RegExp(
  String.raw`\bimport\s*\(\s*${PATH_QUOTED}\s*\)`,
  "g",
);

// Export patterns
const EXPORT_FROM_NAMED = new RegExp(
  String.raw`export\s+\{[\s\S]*?\}${FROM_CLAUSE}`,
  "g",
);
const EXPORT_TYPE_NAMED = new RegExp(
  String.raw`export\s+type\s+\{[\s\S]*?\}${FROM_CLAUSE}`,
  "g",
);
const EXPORT_FROM_ALL = new RegExp(
  String.raw`export\s+\*[^;]*?${FROM_CLAUSE}`,
  "g",
);

// ============================================================================
// Types
// ============================================================================

export interface SourceFile {
  id: string;
  content: string;
  /**
   * External runtime dependencies referenced by this file, keyed by package
   * name with the resolved version as value.
   */
  dependencies?: Record<string, string>;
  /**
   * External dev-only dependencies (currently only @types/*) referenced by
   * this file, keyed by package name with the resolved version as value.
   */
  devDependencies?: Record<string, string>;
}

export interface Source {
  /** The name of the source. */
  name: string;
  /**
   * Dependencies of the source. The key is the name of the dependency and the
   * value is the version.
   */
  dependencies: Record<string, string>;
  /**
   * Development dependencies of the source. The key is the name of the
   * dependency and the value is the version.
   */
  devDependencies: Record<string, string>;
  /** Original unmodified files keyed by absolute id. */
  sources: Record<string, SourceFile>;
  /**
   * Files referenced by the source code where the key is the final relative
   * path to the file.
   */
  files: Record<string, SourceFile>;
}

export type ImportPathType =
  | "import"
  | "import-type"
  | "import-dynamic"
  | "export"
  | "export-type"
  | "export-all";

// Central registry of patterns and their classification
const PATTERNS: Array<[RegExp, ImportPathType]> = [
  [IMPORT_TYPE_NAMED, "import-type"],
  [IMPORT_TYPE_NAMESPACE, "import-type"],
  [IMPORT_DYNAMIC, "import-dynamic"],
  [IMPORT_FROM_ANY, "import"],
  [IMPORT_SIDE_EFFECT, "import"],
  [EXPORT_FROM_NAMED, "export"],
  [EXPORT_TYPE_NAMED, "export-type"],
  [EXPORT_FROM_ALL, "export-all"],
];

// ============================================================================
// Module Path Extraction Helpers
// ============================================================================

/** Extracts the module path from regex match groups (single/double/template). */
function getPathFromGroups(
  groups: RegExpExecArray["groups"],
): string | undefined {
  return groups?.single ?? groups?.double ?? groups?.template;
}

/**
 * Determines the quote character used in regex match groups.
 * Defaults to double quote if no match found.
 */
function getQuoteFromGroups(groups: RegExpExecArray["groups"]): string {
  if (groups?.single != null) return "'";
  if (groups?.double != null) return '"';
  return "`";
}

/**
 * Extracts the comma-separated specifier text inside braces from an
 * import-like declaration string.
 * @example
 * extractSpecifiersInsideBraces('import { A, type B } from "mod";')
 * // Returns "A, type B"
 */
function extractSpecifiersInsideBraces(matchText: string): string | null {
  // Match ` from ` followed by a quote to avoid matching "from" inside identifiers
  // (e.g., `transformFrom`)
  const fromIndex = matchText.search(/\sfrom\s+['"`]/);
  if (fromIndex < 0) return null;
  const beforeFrom = matchText.slice(0, fromIndex);
  const braceStart = beforeFrom.indexOf("{");
  const braceEnd = beforeFrom.lastIndexOf("}");
  if (braceStart < 0 || braceEnd < 0) return null;
  return beforeFrom.slice(braceStart + 1, braceEnd);
}

// ============================================================================
// Public API: Import Path Operations
// ============================================================================

/**
 * Returns the set of module specifiers found in the given `content` across
 * imports, dynamic imports, and re-exports. Inline `type` specifiers within
 * named imports/exports are also considered for their corresponding type kind.
 * @param content - The source code to analyze
 * @param filter - Optional filter to include only specific paths/types
 */
export function getImportPaths(
  content: string,
  filter?: (path: string, type: ImportPathType) => boolean,
): Set<string> {
  const paths = new Set<string>();

  const addPathsFromPattern = (pattern: RegExp, type: ImportPathType) => {
    for (const match of content.matchAll(pattern)) {
      const path = getPathFromGroups(match.groups);
      if (!path) continue;
      if (filter && !filter(path, type)) continue;
      paths.add(path);
    }
  };

  // Process all standard patterns
  for (const [pattern, type] of PATTERNS) {
    addPathsFromPattern(pattern, type);
  }

  // Handle inline type specifiers mixed with value imports/exports:
  // - import { A, type B } from "..." → also count as import-type
  // - export { A, type T } from "..." → also count as export-type
  const addInlineTypeSpecifiers = (pattern: RegExp, type: ImportPathType) => {
    for (const match of content.matchAll(pattern)) {
      const path = getPathFromGroups(match.groups);
      if (!path) continue;

      const inside = extractSpecifiersInsideBraces(match[0]);
      if (inside == null) continue;
      if (!/\btype\b/.test(inside)) continue;

      if (filter && !filter(path, type)) continue;
      paths.add(path);
    }
  };

  addInlineTypeSpecifiers(IMPORT_NAMED, "import-type");
  addInlineTypeSpecifiers(EXPORT_FROM_NAMED, "export-type");

  return paths;
}

/**
 * Replaces module specifiers in any import/export form using the provided
 * `replacer(path, type)` function. Only the quoted path segment is changed so
 * surrounding code remains untouched.
 * @param content - The source code to transform
 * @param replacer - Function that returns the new path for each module
 */
export function replaceImportPaths(
  content: string,
  replacer: (path: string, type: ImportPathType) => string,
): string {
  let result = content;

  const replacePathsForPattern = (pattern: RegExp, type: ImportPathType) => {
    result = result.replace(pattern, (match, ...args) => {
      const groups = args[args.length - 1] as RegExpExecArray["groups"];
      const path = getPathFromGroups(groups);
      if (!path) return match;

      const newPath = replacer(path, type);
      if (newPath === path) return match;

      // Replace only the quoted path segment to preserve surrounding code
      const quote = getQuoteFromGroups(groups);
      const original = `${quote}${path}${quote}`;
      const replacement = `${quote}${newPath}${quote}`;
      const index = match.indexOf(original);
      if (index < 0) return match;

      return (
        match.slice(0, index) +
        replacement +
        match.slice(index + original.length)
      );
    });
  };

  for (const [pattern, type] of PATTERNS) {
    replacePathsForPattern(pattern, type);
  }

  return result;
}

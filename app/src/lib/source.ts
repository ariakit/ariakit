/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

import { dirname, extname, relative, resolve } from "node:path";
import type { StyleDependency } from "./styles.ts";

// Import and export patterns

// Shared quoted path fragment to capture module specifiers and preserve quote
// type. Supports single quotes, double quotes, and template literals (without
// interpolation).
const PATH_QUOTED = String.raw`(?:'(?<single>[^']+)'|"(?<double>[^"]+)"|\`(?<template>(?:[^\`$]|\$(?!\{))+?)\`)`;
const FROM_CLAUSE = String.raw`\s+from\s+${PATH_QUOTED}`;
const IMPORT_ATTRIBUTES = String.raw`(?<attributes>\s+(?:with|assert)\s+\{[\s\S]*?\})?`;

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

// Source model

export interface SourceFile {
  id: string;
  content: string;
  styles?: StyleDependency[];
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
  /**
   * Styles referenced by the source code. This follows the same shape as items
   * in `dependencies` arrays within `app/src/styles/styles.json` (name, type,
   * and optionally module/import).
   */
  styles: StyleDependency[];
}

export type ImportPathType =
  | "import"
  | "import-type"
  | "import-dynamic"
  | "export"
  | "export-type"
  | "export-all";

// Import pattern classification

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

// Text and module-specifier helpers

/** Sorts an iterable of strings lexicographically. */
function sortStrings<T extends string>(values: Iterable<T>): T[] {
  return Array.from(values).sort((a, b) => a.localeCompare(b));
}

/**
 * Gets or creates a value in a Map. If the key doesn't exist, the factory
 * function is called to create the initial value.
 */
function getOrCreate<K, V>(map: Map<K, V>, key: K, factory: () => V): V {
  const existing = map.get(key);
  if (existing !== undefined) return existing;
  const created = factory();
  map.set(key, created);
  return created;
}

/**
 * Removes lines that only contain a semicolon, which may be left after
 * deleting import declarations via regex replacements.
 */
function cleanSemicolonOnlyLines(text: string): string {
  return text.replace(/^[\t ]*;[\t ]*(?:\r?\n|$)/gm, "");
}

/**
 * Collapses 3+ consecutive newlines into at most 2 to keep content compact
 * without shifting line numbers excessively.
 */
function collapseExcessBlankLines(text: string): string {
  return text.replace(/\n{3,}/g, "\n\n");
}

/** Applies common cleanup transformations to text after import manipulation. */
function cleanupText(text: string): string {
  return collapseExcessBlankLines(cleanSemicolonOnlyLines(text));
}

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

function getAttributesFromGroups(groups: RegExpExecArray["groups"]): string {
  return groups?.attributes ?? "";
}

function buildModuleSource(path: string, attributes = ""): string {
  return `"${path}"${attributes}`;
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

// Import specifier parsing

interface ParsedSpecifiers {
  runtime: string[];
  typeOnly: string[];
}

/**
 * Normalizes an import specifier, collapsing whitespace while preserving `as`
 * aliases.
 * @example
 * normalizeSpecifier("Foo  as  Bar") // Returns "Foo as Bar"
 * normalizeSpecifier("Foo") // Returns "Foo"
 */
function normalizeSpecifier(specifier: string): string {
  return specifier.trim().replace(/\s+/g, " ");
}

/**
 * Parses a named import specifier list, separating runtime and type-only
 * names. Handles inline `type` modifiers.
 * @example
 * parseNamedSpecifiers("A, type B, C as D")
 * // Returns { runtime: ["A", "C as D"], typeOnly: ["B"] }
 */
function parseNamedSpecifiers(inside: string): ParsedSpecifiers {
  const runtime: string[] = [];
  const typeOnly: string[] = [];

  const items = inside
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  for (const item of items) {
    const isType = /^type\s+/i.test(item);
    const raw = isType ? item.replace(/^type\s+/i, "") : item;
    const name = normalizeSpecifier(raw);
    if (!name) continue;

    if (isType) {
      typeOnly.push(name);
    } else {
      runtime.push(name);
    }
  }
  return { runtime, typeOnly };
}

/**
 * Parses a type-only import specifier list (from `import type { ... }`).
 * All specifiers are assumed to be type-only.
 */
function parseTypeOnlySpecifiers(inside: string): string[] {
  return inside
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map(normalizeSpecifier)
    .filter(Boolean);
}

// Import path operations

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

// Named import merging

/**
 * Builds hoisted import declaration strings from collected specifier maps.
 * Orders type-only imports before value imports for each module.
 */
function buildHoistedImports(
  valueNamed: Map<string, Set<string>>,
  typeNamed: Map<string, Set<string>>,
): string {
  const allSources = sortStrings(
    new Set<string>([...valueNamed.keys(), ...typeNamed.keys()]),
  );

  const lines: string[] = [];
  for (const moduleSource of allSources) {
    const typeNames = typeNamed.get(moduleSource);
    const valueNames = valueNamed.get(moduleSource);

    if (typeNames?.size) {
      const sorted = sortStrings(typeNames).join(", ");
      lines.push(`import type { ${sorted} } from ${moduleSource};`);
    }
    if (valueNames?.size) {
      const sorted = sortStrings(valueNames).join(", ");
      lines.push(`import { ${sorted} } from ${moduleSource};`);
    }
  }

  return lines.join("\n");
}

/**
 * Builds a replacement import statement for remaining (untransformed)
 * specifiers. Returns empty string if no specifiers remain.
 *
 * The specifier list is re-emitted on one line per kind, which deliberately
 * discards the author's original wrapping; any import-attributes clause is
 * carried through verbatim. Restoring the original text here is not the fix
 * for an over-width line.
 */
function buildRemainingImport(
  remainingRuntime: string[],
  remainingType: string[],
  moduleSource: string,
): string {
  if (remainingRuntime.length === 0 && remainingType.length === 0) {
    return "";
  }

  if (remainingRuntime.length > 0 && remainingType.length > 0) {
    return [
      `import { ${remainingRuntime.join(", ")} } from ${moduleSource};`,
      `import type { ${remainingType.join(", ")} } from ${moduleSource};`,
    ].join("\n");
  }

  if (remainingRuntime.length > 0) {
    return `import { ${remainingRuntime.join(", ")} } from ${moduleSource};`;
  }

  return `import type { ${remainingType.join(", ")} } from ${moduleSource};`;
}

/**
 * Inserts hoisted imports into the body, placing them after any existing
 * leading imports or at the top if none exist.
 */
function insertHoistedImports(hoisted: string, body: string): string {
  if (!hoisted) return collapseExcessBlankLines(body);

  const leadingImports = body.match(/^(?:[\t ]*import[\s\S]*?;\r?\n)+/);
  if (leadingImports) {
    const head = leadingImports[0] ?? "";
    const tail = body.slice(head.length);
    return collapseExcessBlankLines(`${head}${hoisted}\n${tail}`);
  }

  return collapseExcessBlankLines(`${hoisted}\n${body}`);
}

/**
 * Hoists transformed named imports, handling runtime and type specifiers
 * separately. Returning `false` keeps specifiers in place, but value imports
 * are rebuilt while `import type` declarations retain their text. Only hoisted
 * specifiers are sorted and deduplicated; default and namespace imports are not
 * handled. Inline `type` specifiers are split into their corresponding groups,
 * and hoisted type imports are emitted before value imports.
 *
 * See https://github.com/ariakit/ariakit/pull/6918
 * @param content - Source code to transform.
 * @param transform - Returns a new path or `false` to leave that group in
 *   place.
 */
export function mergeImports(
  content: string,
  transform: (path: string, type: ImportPathType) => string | false,
): string {
  // Collect transformed specifiers by final module source.
  const valueNamed = new Map<string, Set<string>>();
  const typeNamed = new Map<string, Set<string>>();

  const addSpecifiers = (
    originalPath: string,
    names: string[],
    type: ImportPathType,
    attributes = "",
  ) => {
    const transformedPath = transform(originalPath, type);
    if (transformedPath === false) return;

    const collector = type === "import" ? valueNamed : typeNamed;
    const nextAttributes = transformedPath === originalPath ? attributes : "";
    const moduleSource = buildModuleSource(transformedPath, nextAttributes);
    const specifiers = getOrCreate(collector, moduleSource, () => new Set());
    for (const name of names) {
      specifiers.add(name);
    }
  };

  const collectFromMatches = (pattern: RegExp, isTypeOnly: boolean) => {
    for (const match of content.matchAll(pattern)) {
      const path = getPathFromGroups(match.groups);
      if (!path) continue;

      const inside = extractSpecifiersInsideBraces(match[0]);
      if (inside == null) continue;

      const attributes = getAttributesFromGroups(match.groups);
      if (isTypeOnly) {
        const items = parseTypeOnlySpecifiers(inside);
        if (items.length) {
          addSpecifiers(path, items, "import-type", attributes);
        }
        continue;
      }

      const { runtime, typeOnly } = parseNamedSpecifiers(inside);
      if (runtime.length) {
        addSpecifiers(path, runtime, "import", attributes);
      }
      if (typeOnly.length) {
        addSpecifiers(path, typeOnly, "import-type", attributes);
      }
    }
  };

  collectFromMatches(IMPORT_NAMED, false);
  collectFromMatches(IMPORT_TYPE_NAMED, true);

  const hoisted = buildHoistedImports(valueNamed, typeNamed);

  // Rewrite originals, retaining only untransformed specifiers.
  // Removed declarations leave a semicolon marker for the cleanup pass.
  let body = content;

  const replaceImportDeclarations = (pattern: RegExp, isTypeOnly: boolean) => {
    body = body.replace(pattern, (match, ...args) => {
      const groups = args[args.length - 1] as RegExpExecArray["groups"];
      const path = getPathFromGroups(groups);
      if (!path) return match;

      const inside = extractSpecifiersInsideBraces(match);
      if (inside == null) return match;

      if (isTypeOnly) {
        const items = parseTypeOnlySpecifiers(inside);
        if (!items.length) return match;

        const transformed = transform(path, "import-type");
        if (transformed === false) return match;

        return ";";
      }

      const { runtime, typeOnly } = parseNamedSpecifiers(inside);
      const transformedValue = runtime.length
        ? transform(path, "import")
        : false;
      const transformedType = typeOnly.length
        ? transform(path, "import-type")
        : false;

      const remainingRuntime = transformedValue === false ? runtime : [];
      const remainingType = transformedType === false ? typeOnly : [];
      const attributes = getAttributesFromGroups(groups);
      const source = buildModuleSource(path, attributes);

      return (
        buildRemainingImport(remainingRuntime, remainingType, source) || ";"
      );
    });
  };

  replaceImportDeclarations(IMPORT_TYPE_NAMED, true);
  replaceImportDeclarations(IMPORT_NAMED, false);

  body = cleanSemicolonOnlyLines(body);

  return insertHoistedImports(hoisted, body);
}

// File resolution and dependency ordering

/**
 * Resolves a relative import specifier from a given file id to an absolute id
 * present in the input map. Handles extensionless specifiers by trying .ts and
 * .tsx extensions. Does not attempt index files.
 */
function resolveSpecifierToId(
  files: Record<string, SourceFile>,
  fromId: string,
  specifier: string,
): string | null {
  if (!specifier || !specifier.startsWith(".")) return null;

  const baseDir = dirname(fromId);
  const absolute = resolve(baseDir, specifier);

  if (files[absolute]) return absolute;

  if (!extname(absolute)) {
    const withTs = `${absolute}.ts`;
    if (files[withTs]) return withTs;

    const withTsx = `${absolute}.tsx`;
    if (files[withTsx]) return withTsx;
  }

  return null;
}

/**
 * Inserts a value into a sorted array, maintaining lexical order.
 */
function insertSorted(array: string[], value: string): void {
  for (let i = 0; i < array.length; i++) {
    const current = array[i];
    if (current && value.localeCompare(current) < 0) {
      array.splice(i, 0, value);
      return;
    }
  }
  array.push(value);
}

/**
 * Computes topological order of a group's members based on internal imports.
 * Files that import other files are placed after their dependencies.
 * Uses Kahn's algorithm with lexical tie-breaker for determinism.
 * Falls back to lexicographic order if a cycle is detected.
 */
function computeTopologicalOrder(
  files: Record<string, SourceFile>,
  memberIds: string[],
): string[] {
  const memberSet = new Set(memberIds);

  const adjacency = new Map<string, Set<string>>();
  const indegree = new Map<string, number>();

  for (const id of memberIds) {
    adjacency.set(id, new Set());
    indegree.set(id, 0);
  }

  // A imports B becomes B → A so dependencies sort first.
  for (const id of memberIds) {
    const content = files[id]?.content ?? "";

    const addDependencyEdges = (pattern: RegExp) => {
      for (const match of content.matchAll(pattern)) {
        const importPath = getPathFromGroups(match.groups);
        if (!importPath) continue;

        const resolvedId = resolveSpecifierToId(files, id, importPath);
        if (!resolvedId) continue;
        if (!memberSet.has(resolvedId)) continue;

        const neighbors = adjacency.get(resolvedId);
        if (neighbors && !neighbors.has(id)) {
          neighbors.add(id);
          indegree.set(id, (indegree.get(id) ?? 0) + 1);
        }
      }
    };

    addDependencyEdges(IMPORT_FROM_ANY);
    addDependencyEdges(IMPORT_TYPE_NAMED);
  }

  // Lexical tie-breaking keeps generated output deterministic.
  const queue: string[] = [];
  for (const id of memberIds) {
    if ((indegree.get(id) ?? 0) === 0) {
      queue.push(id);
    }
  }
  queue.sort((a, b) => a.localeCompare(b));

  const ordered: string[] = [];
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;

    ordered.push(current);

    const neighbors = sortStrings(adjacency.get(current) ?? []);
    for (const neighbor of neighbors) {
      const newDegree = (indegree.get(neighbor) ?? 0) - 1;
      indegree.set(neighbor, newDegree);

      if (newDegree === 0) {
        insertSorted(queue, neighbor);
      }
    }
  }

  // Fall back to lexical order when the dependency graph contains a cycle.
  if (ordered.length !== memberIds.length) {
    return [...memberIds].sort((a, b) => a.localeCompare(b));
  }

  return ordered;
}

// Internal import and metadata merging

/**
 * Removes import declarations that target other members of the same group.
 * Throws if namespace imports are found (not supported for merging).
 */
function stripInternalImports(
  files: Record<string, SourceFile>,
  fromId: string,
  content: string,
  groupIds: Set<string>,
): string {
  let body = content;

  const removeMatchingImports = (pattern: RegExp) => {
    body = body.replace(pattern, (match, ...args) => {
      const groups = args[args.length - 1] as RegExpExecArray["groups"];
      const specifier = getPathFromGroups(groups);
      if (!specifier) return match;

      const resolvedId = resolveSpecifierToId(files, fromId, specifier);
      if (!resolvedId) return match;
      if (!groupIds.has(resolvedId)) return match;

      if (/\bimport\s+\*\s+as\s+/.test(match)) {
        throw new Error(
          `Namespace imports from internal files are not supported: "${specifier}"`,
        );
      }

      return ";";
    });
  };

  removeMatchingImports(IMPORT_TYPE_NAMED);
  removeMatchingImports(IMPORT_NAMED);
  removeMatchingImports(IMPORT_FROM_ANY);
  removeMatchingImports(IMPORT_SIDE_EFFECT);

  return cleanupText(body);
}

/** Creates a unique key for a style dependency. */
function getStyleKey(dep: StyleDependency): string {
  return `${dep.type}:${dep.name}:${dep.module ?? ""}:${dep.import ?? ""}`;
}

/**
 * Merges multiple style dependency arrays, deduplicating by identity.
 * Returns undefined if no styles remain.
 */
function mergeStyles(
  ...lists: Array<StyleDependency[] | undefined>
): StyleDependency[] | undefined {
  const result: StyleDependency[] = [];
  const seen = new Set<string>();

  for (const list of lists) {
    if (!list) continue;
    for (const dep of list) {
      const key = getStyleKey(dep);
      if (seen.has(key)) continue;
      seen.add(key);
      result.push(dep);
    }
  }

  return result.length ? result : undefined;
}

/**
 * Merges multiple dependency maps, preserving first-seen version on conflicts.
 * Returns undefined if no dependencies remain.
 */
function mergeDependencyMaps(
  ...maps: Array<Record<string, string> | undefined>
): Record<string, string> | undefined {
  const result: Record<string, string> = {};

  for (const map of maps) {
    if (!map) continue;
    for (const [pkg, version] of Object.entries(map)) {
      if (result[pkg] != null) continue;
      result[pkg] = version;
    }
  }

  return Object.keys(result).length ? result : undefined;
}

// Import hoisting

/**
 * Parses a namespace value import statement.
 * @returns Tuple of [alias, modulePath] or null if not a match
 */
function parseNamespaceValueImport(stmt: string): [string, string] | null {
  const match = stmt.match(
    /^import\s+\*\s+as\s+([\w$]+)\s+from\s+['"`](.*?)['"`]/,
  );
  if (match == null) return null;
  if (match[1] == null) return null;
  if (match[2] == null) return null;
  return [match[1], match[2]];
}

/**
 * Parses a namespace type import statement.
 * @returns Tuple of [alias, modulePath] or null if not a match
 */
function parseNamespaceTypeImport(stmt: string): [string, string] | null {
  const match = stmt.match(
    /^import\s+type\s+\*\s+as\s+([\w$]+)\s+from\s+['"`](.*?)['"`]/,
  );
  if (match == null) return null;
  if (match[1] == null) return null;
  if (match[2] == null) return null;
  return [match[1], match[2]];
}

/**
 * Hoists import declarations to the top of the content.
 * Deduplicates namespace imports where a value import makes a type import
 * redundant.
 */
export function hoistImports(content: string): string {
  const imports = new Set<string>();
  let body = content;

  const extractImports = (pattern: RegExp) => {
    body = body.replace(pattern, (match) => {
      imports.add(match);
      return "";
    });
  };

  extractImports(IMPORT_SIDE_EFFECT);
  extractImports(IMPORT_TYPE_NAMED);
  extractImports(IMPORT_TYPE_NAMESPACE);
  extractImports(IMPORT_FROM_ANY);

  body = cleanupText(body);

  if (imports.size === 0) return content;

  // A value namespace import makes the matching type import redundant.
  const namespaceValueImports = new Set<string>();
  for (const stmt of imports) {
    const parsed = parseNamespaceValueImport(stmt);
    if (parsed) {
      namespaceValueImports.add(`${parsed[0]}|${parsed[1]}`);
    }
  }

  const finalImports = new Set<string>();
  for (const stmt of imports) {
    const parsed = parseNamespaceTypeImport(stmt);
    if (parsed) {
      const key = `${parsed[0]}|${parsed[1]}`;
      if (namespaceValueImports.has(key)) continue;
    }
    finalImports.add(stmt);
  }

  return `${sortStrings(finalImports).join("\n")}\n\n${body.trimStart()}`;
}

// File grouping and merging

interface MergedGroup {
  target: string;
  content: string;
  styles?: StyleDependency[];
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

/**
 * Builds a mapping from file ids to their merge target (or null to keep as-is).
 */
function buildTargetMapping(
  files: Record<string, SourceFile>,
  filter?: (path: string) => string | boolean,
): Map<string, string | null> {
  const targetById = new Map<string, string | null>();

  if (filter) {
    for (const id of Object.keys(files)) {
      const result = filter(id);
      targetById.set(id, typeof result === "string" ? result : null);
    }
    return targetById;
  }

  // By default, merge directories containing at least two files.
  const filesByDirectory = new Map<string, string[]>();
  for (const id of Object.keys(files)) {
    const dir = dirname(id);
    const dirFiles = getOrCreate(filesByDirectory, dir, () => []);
    dirFiles.push(id);
  }

  for (const [dir, ids] of filesByDirectory) {
    const target = ids.length >= 2 ? `${dir}.ts` : null;
    for (const id of ids) {
      targetById.set(id, target);
    }
  }

  return targetById;
}

/**
 * Groups file ids by their merge target.
 */
function groupFilesByTarget(
  targetById: Map<string, string | null>,
): Map<string, string[]> {
  const membersByTarget = new Map<string, string[]>();

  for (const [id, target] of targetById) {
    if (!target) continue;
    const members = getOrCreate(membersByTarget, target, () => []);
    members.push(id);
  }

  // Stabilize member order before building groups.
  for (const members of membersByTarget.values()) {
    members.sort((a, b) => a.localeCompare(b));
  }

  return membersByTarget;
}

/**
 * Merges a group of files into a single output.
 */
function mergeFileGroup(
  files: Record<string, SourceFile>,
  target: string,
  memberIds: string[],
): MergedGroup {
  const order = computeTopologicalOrder(files, memberIds);
  const groupSet = new Set(memberIds);

  // Concatenate dependencies before their importers.
  const parts: string[] = [];
  for (let i = 0; i < order.length; i++) {
    const id = order[i];
    if (!id) continue;
    const file = files[id];
    if (!file) continue;

    let stripped = stripInternalImports(files, id, file.content, groupSet);
    stripped = i === 0 ? stripped.trimEnd() : stripped.trim();
    parts.push(stripped);
  }

  // Merge metadata lexically so graph order cannot affect the result.
  const sortedIds = [...memberIds].sort((a, b) => a.localeCompare(b));
  let mergedStyles: StyleDependency[] | undefined;
  let mergedDeps: Record<string, string> | undefined;
  let mergedDevDeps: Record<string, string> | undefined;

  for (const id of sortedIds) {
    const file = files[id];
    if (!file) continue;
    mergedStyles = mergeStyles(mergedStyles, file.styles);
    mergedDeps = mergeDependencyMaps(mergedDeps, file.dependencies);
    mergedDevDeps = mergeDependencyMaps(mergedDevDeps, file.devDependencies);
  }

  const content = `${parts.join("\n\n").trimEnd()}\n`;
  const hoistedContent = hoistImports(content);

  return {
    target,
    content: hoistedContent,
    styles: mergedStyles,
    dependencies: mergedDeps,
    devDependencies: mergedDevDeps,
  };
}

/**
 * Rewrites imports in a non-merged file to point to merged targets.
 */
function rewriteImportsForMergedTargets(
  files: Record<string, SourceFile>,
  file: SourceFile,
  targetById: Map<string, string | null>,
): SourceFile {
  const fileDir = dirname(file.id);

  const rewritten = mergeImports(file.content, (importPath) => {
    const resolvedId = resolveSpecifierToId(files, file.id, importPath);
    if (!resolvedId) return false;

    const target = targetById.get(resolvedId);
    if (!target) return false;

    const relativePath = relative(fileDir, target).replace(/\\/g, "/");
    return relativePath.startsWith(".") ? relativePath : `./${relativePath}`;
  });

  return {
    id: file.id,
    content: rewritten,
    styles: file.styles,
    dependencies: file.dependencies,
    devDependencies: file.devDependencies,
  };
}

/**
 * Merges related files into grouped targets and rewrites named imports to point
 * at the merged output when appropriate. By default groups files by their
 * parent directory (directories with 2+ files produce `<dir>.ts`).
 *
 * @param files - Input files keyed by absolute path
 * @param filter - Optional function to determine merge targets. Return a string
 *   path to merge to that target, or false/boolean to keep the file as-is.
 */
export function mergeFiles(
  files: Record<string, SourceFile>,
  filter?: (path: string) => string | boolean,
): Record<string, SourceFile> {
  const targetById = buildTargetMapping(files, filter);
  const membersByTarget = groupFilesByTarget(targetById);

  // Build merged groups before rewriting imports in files kept as-is.
  const mergedGroups: MergedGroup[] = [];
  for (const [target, memberIds] of membersByTarget) {
    mergedGroups.push(mergeFileGroup(files, target, memberIds));
  }

  const result: Record<string, SourceFile> = {};

  for (const [id, file] of Object.entries(files)) {
    if (targetById.get(id)) continue;
    result[id] = rewriteImportsForMergedTargets(files, file, targetById);
  }

  // Append merged groups in stable target order.
  mergedGroups.sort((a, b) => a.target.localeCompare(b.target));
  for (const group of mergedGroups) {
    result[group.target] = {
      id: group.target,
      content: group.content,
      styles: group.styles,
      dependencies: group.dependencies,
      devDependencies: group.devDependencies,
    };
  }

  return result;
}

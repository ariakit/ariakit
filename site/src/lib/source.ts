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

// Shared quoted path fragment to capture module specifiers and preserve quote type
const PATH_QUOTED = String.raw`(?:'(?<single>[^']+)'|"(?<double>[^"]+)"|\`(?<template>(?:[^\`$]|\$(?!\{))+?)\`)`;
const FROM_CLAUSE = String.raw`\s+from\s+${PATH_QUOTED}`;

const IMPORT_SIDE_EFFECT = new RegExp(String.raw`import\s+${PATH_QUOTED}`, "g");
const IMPORT_NAMED = new RegExp(
  String.raw`import\s+(?!type\b)\{[\s\S]*?\}${FROM_CLAUSE}`,
  "g",
);
const IMPORT_FROM_ANY = new RegExp(
  String.raw`import\s+(?!type\b)[^;]*?${FROM_CLAUSE}`,
  "g",
);
const IMPORT_TYPE_NAMED = new RegExp(
  String.raw`import\s+type\s+\{[\s\S]*?\}${FROM_CLAUSE}`,
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
  /**
   * The name of the source.
   */
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
  /**
   * Original unmodified files keyed by absolute id.
   */
  sources: Record<string, SourceFile>;
  /**
   * Files referenced by the source code where the key is the final relative
   * path to the file.
   */
  files: Record<string, SourceFile>;
  /**
   * Styles referenced by the source code. This follows the same shape as items
   * in `dependencies` arrays within `site/src/styles/styles.json` (name, type,
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

// Central registry of patterns and their classification
const PATTERNS: Array<[RegExp, ImportPathType]> = [
  [IMPORT_TYPE_NAMED, "import-type"],
  [IMPORT_DYNAMIC, "import-dynamic"],
  [IMPORT_FROM_ANY, "import"],
  [IMPORT_SIDE_EFFECT, "import"],
  [EXPORT_FROM_NAMED, "export"],
  [EXPORT_TYPE_NAMED, "export-type"],
  [EXPORT_FROM_ALL, "export-all"],
];

function sortKeys<T extends string>(values: Iterable<T>): T[] {
  return Array.from(values).sort((a, b) => a.localeCompare(b));
}

function getPathFromGroups(groups: RegExpExecArray["groups"]) {
  return groups?.single ?? groups?.double ?? groups?.template;
}

/**
 * Extracts the comma-separated specifier text inside braces from an import-like
 * declaration string. Example: `import { A, type B } from "mod";` →
 * returns `"A, type B"`. Returns null if braces cannot be found before `from`.
 */
function extractSpecifiersInsideBraces(matchText: string): string | null {
  const beforeFrom = matchText.slice(0, matchText.indexOf("from"));
  const braceStart = beforeFrom.indexOf("{");
  const braceEnd = beforeFrom.lastIndexOf("}");
  if (braceStart < 0 || braceEnd < 0) {
    return null;
  }
  return beforeFrom.slice(braceStart + 1, braceEnd);
}

/**
 * Removes lines that only contain a semicolon, which may be left after
 * deleting import declarations via regex replacements.
 */
function cleanSemicolonOnlyLines(text: string): string {
  return text.replace(/^[\t ]*;[\t ]*\r?\n/gm, "");
}

/**
 * Collapses 3+ consecutive newlines into at most 2 to keep content compact
 * without shifting line numbers excessively.
 */
function collapseExcessBlankLines(text: string): string {
  return text.replace(/\n{3,}/g, "\n\n");
}

/**
 * Returns the set of module specifiers found in the given `content` across
 * imports, dynamic imports, and re-exports. Inline `type` specifiers within
 * named imports/exports are also considered for their corresponding type kind.
 */
export function getImportPaths(
  content: string,
  filter?: (path: string, type: ImportPathType) => boolean,
) {
  const paths = new Set<string>();
  const addPath = (pattern: RegExp, type: ImportPathType) => {
    for (const match of content.matchAll(pattern)) {
      const groups = match.groups;
      if (!groups) continue;
      const path = getPathFromGroups(groups);
      if (!path) continue;
      if (filter && !filter(path, type)) continue;
      paths.add(path);
    }
  };
  for (const [pattern, type] of PATTERNS) {
    addPath(pattern, type);
  }
  // Inline type specifiers mixed with value imports/exports
  // import { A, type B } from "..." → also count as import-type
  // export { A, type T } from "..." → also count as export-type
  const addInline = (pattern: RegExp, type: ImportPathType) => {
    for (const match of content.matchAll(pattern)) {
      const groups = match.groups;
      if (!groups) continue;
      const path = getPathFromGroups(groups);
      if (!path) continue;
      const inside = extractSpecifiersInsideBraces(match[0]);
      if (inside == null) continue;
      if (!/\btype\b/.test(inside)) continue;
      if (filter && !filter(path, type)) continue;
      paths.add(path);
    }
  };
  addInline(IMPORT_NAMED, "import-type");
  addInline(EXPORT_FROM_NAMED, "export-type");
  return paths;
}

/**
 * Replaces module specifiers in any import/export form using the provided
 * `replacer(path, type)` function. Only the quoted path segment is changed so
 * surrounding code remains untouched.
 */
export function replaceImportPaths(
  content: string,
  replacer: (path: string, type: ImportPathType) => string,
) {
  const replaceFor = (pattern: RegExp, type: ImportPathType) => {
    content = content.replace(pattern, (match, ...args) => {
      const groups = args.at(-1) as RegExpExecArray["groups"];
      const path = getPathFromGroups(groups);
      if (!path) return match;
      const next = replacer(path, type);
      if (next === path) return match;
      // Replace only the quoted path segment to avoid touching other text
      const quote =
        groups?.single != null ? "'" : groups?.double != null ? '"' : "`";
      const quoted = `${quote}${path}${quote}`;
      const nextQuoted = `${quote}${next}${quote}`;
      const idx = match.indexOf(quoted);
      if (idx < 0) return match; // Fallback: no change
      return (
        match.slice(0, idx) + nextQuoted + match.slice(idx + quoted.length)
      );
    });
  };
  for (const [re, type] of PATTERNS) replaceFor(re, type);
  return content;
}

/**
 * Parse a named import specifier list, separating runtime and type names
 */
function parseNamedSpecifiers(inside: string) {
  const runtime: string[] = [];
  const typeOnly: string[] = [];
  const items = inside
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  for (const item of items) {
    const isType = /^type\s+/i.test(item);
    const raw = isType ? item.replace(/^type\s+/i, "") : item;
    const first = raw.split(/\s+as\s+/i)[0] ?? "";
    const name = first.trim();
    if (!name) continue;
    if (isType) {
      typeOnly.push(name);
    } else {
      runtime.push(name);
    }
  }
  return { runtime, typeOnly };
}

function parseTypeOnlySpecifiers(inside: string) {
  return inside
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => (s.split(/\s+as\s+/i)[0] ?? "").trim())
    .filter(Boolean);
}

/**
 * Merges named import declarations within a single source string, hoisting them
 * to the top and separating runtime (`import { ... }`) and type-only
 * (`import type { ... }`) groups.
 *
 * - Applies the provided `transform` function to each original module path; if
 *   it returns a string, the corresponding specifiers are merged and hoisted.
 *   If it returns `false`, the original imports are left untouched.
 * - For mixed named imports that include both transformed and non-transformed
 *   specifiers, only the transformed specifiers are hoisted; the remaining
 *   specifiers stay in place and the original import line may be rewritten to
 *   preserve them without duplication.
 * - Deduplicates specifiers by name and sorts both specifier names and module
 *   specifiers lexicographically within each group.
 * - Preserves overall content by removing the original named import statements
 *   and returning the full transformed content with hoisted imports. Any
 *   orphaned semicolon-only lines left by the removal are also cleaned up to
 *   keep line breaks stable.
 * - Always orders hoisted imports with type-only (`import type`) first, then
 *   value imports, per final module path.
 *
 * Notes:
 * - Default imports and namespace imports are not handled here.
 * - Inline `type` specifiers (e.g., `import { A, type T } from "..."`) are
 *   split across runtime and type groups for the same module.
 */
export function mergeImports(
  content: string,
  transform: (path: string, type: ImportPathType) => string | false,
) {
  // Collect value and type-only named imports keyed by the final transformed path
  const valueNamed = new Map<string, Set<string>>();
  const typeNamed = new Map<string, Set<string>>();

  const addMany = (
    originalPath: string,
    names: string[],
    type: ImportPathType,
  ) => {
    const nextPath = transform(originalPath, type);
    if (nextPath === false) return;
    const collector = type === "import" ? valueNamed : typeNamed;
    if (!collector.has(nextPath)) {
      collector.set(nextPath, new Set());
    }
    const set = collector.get(nextPath)!;
    for (const name of names) {
      set.add(name);
    }
  };

  const handleMatches = (pattern: RegExp, forcedTypeOnly: boolean) => {
    for (const match of content.matchAll(pattern)) {
      const groups = match.groups;
      const path = getPathFromGroups(groups);
      if (!path) continue;
      const inside = extractSpecifiersInsideBraces(match[0]);
      if (inside == null) continue;
      if (forcedTypeOnly) {
        const items = parseTypeOnlySpecifiers(inside);
        if (items.length) {
          addMany(path, items, "import-type");
        }
        continue;
      }
      const { runtime, typeOnly } = parseNamedSpecifiers(inside);
      if (runtime.length) {
        addMany(path, runtime, "import");
      }
      if (typeOnly.length) {
        addMany(path, typeOnly, "import-type");
      }
    }
  };

  handleMatches(IMPORT_NAMED, false);
  handleMatches(IMPORT_TYPE_NAMED, true);

  // Build merged import declarations per final path (sorted), always placing
  // type-only imports before value imports for each module.
  const finalPaths = sortKeys(
    new Set<string>([...valueNamed.keys(), ...typeNamed.keys()]),
  );

  const hoistedLines: string[] = [];
  for (const mod of finalPaths) {
    const typeNames = typeNamed.get(mod);
    const valueNames = valueNamed.get(mod);
    if (typeNames?.size) {
      hoistedLines.push(
        `import type { ${sortKeys(typeNames.keys()).join(", ")} } from "${mod}";`,
      );
    }
    if (valueNames?.size) {
      hoistedLines.push(
        `import { ${sortKeys(valueNames.keys()).join(", ")} } from "${mod}";`,
      );
    }
  }
  const hoisted = hoistedLines.join("\n");

  // Remove or rewrite ONLY the named import declarations that are transformed.
  // Non-transformed imports are left intact.
  let body = content;

  const replaceImportDecls = (pattern: RegExp, forcedTypeOnly: boolean) => {
    body = body.replace(pattern, (match, ...args) => {
      const groups = args.at(-1) as RegExpExecArray["groups"];
      const offset = (args.at(-3) as number) ?? 0;
      const full = (args.at(-2) as string) ?? body;
      const path = getPathFromGroups(groups);
      if (!path) return match;
      const inside = extractSpecifiersInsideBraces(match);
      if (inside == null) return match;

      if (forcedTypeOnly) {
        const items = parseTypeOnlySpecifiers(inside);
        if (!items.length) return match;
        const next = transform(path, "import-type");
        if (next === false) return match; // ignore non-transformed imports
        // Entire declaration is transformed; drop it (it will be hoisted).
        // Also consume a trailing semicolon if present immediately after match.
        const end = offset + match.length;
        if (full[end] === ";") return ""; // the semicolon remains but we'll remove stray ; lines below
        return "";
      }

      const { runtime, typeOnly } = parseNamedSpecifiers(inside);
      const nextValue = runtime.length ? transform(path, "import") : false;
      const nextType = typeOnly.length ? transform(path, "import-type") : false;

      const remainingRuntime = nextValue === false ? runtime : [];
      const remainingType = nextType === false ? typeOnly : [];

      // If nothing remains (all specifiers transformed), remove the line.
      if (remainingRuntime.length === 0 && remainingType.length === 0) {
        return "";
      }

      // Keep remaining specifiers. If both kinds remain, split into two lines
      // to avoid reintroducing transformed specifiers inline. Do NOT include
      // semicolons here; we'll reuse the original trailing semicolon.
      if (remainingRuntime.length > 0 && remainingType.length > 0) {
        return [
          `import { ${remainingRuntime.join(", ")} } from "${path}"`,
          `import type { ${remainingType.join(", ")} } from "${path}"`,
        ].join("\n");
      }
      if (remainingRuntime.length > 0) {
        return `import { ${remainingRuntime.join(", ")} } from "${path}"`;
      }
      return `import type { ${remainingType.join(", ")} } from "${path}"`;
    });
  };

  replaceImportDecls(IMPORT_TYPE_NAMED, true);
  replaceImportDecls(IMPORT_NAMED, false);

  // Clean up stray semicolon-only lines that can be left behind by the regex
  body = cleanSemicolonOnlyLines(body);

  // Insert hoisted imports after any leading import declarations (of any kind)
  // that remain in the body; otherwise, place them at the very top. This keeps
  // non-transformed imports in the same relative position.
  if (hoisted) {
    const leadingImports = body.match(/^(?:[\t ]*import[\s\S]*?;\r?\n)+/);
    if (leadingImports) {
      const head = leadingImports[0] ?? "";
      const tail = body.slice(head.length);
      return collapseExcessBlankLines(`${head}${hoisted}\n${tail}`);
    }
    return collapseExcessBlankLines(`${hoisted}\n${body}`);
  }
  return collapseExcessBlankLines(body);
}

/**
 * Resolve a relative import specifier from a given file id to an absolute id
 * present in the input map. Handles extensionless specifiers by trying .ts.
 * Does not attempt index files.
 */
function resolveSpecifierToId(
  files: Record<string, SourceFile>,
  fromId: string,
  spec: string,
): string | null {
  if (!spec || !spec.startsWith(".")) return null;
  const baseDir = dirname(fromId);
  const absolute = resolve(baseDir, spec);
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
 * Compute topological order of a group's members based on internal named/type imports.
 * Edges: A -> B if A imports B (relative specifier resolving to B in the group).
 */
function topoOrderGroup(
  files: Record<string, SourceFile>,
  memberIds: string[],
): string[] {
  const memberSet = new Set(memberIds);
  // Build adjacency and indegree
  const adj = new Map<string, Set<string>>();
  const indegree = new Map<string, number>();
  for (const id of memberIds) {
    adj.set(id, new Set());
    indegree.set(id, 0);
  }
  for (const id of memberIds) {
    const content = files[id]?.content ?? "";
    const addDeps = (pattern: RegExp) => {
      for (const m of content.matchAll(pattern)) {
        const groups = m.groups;
        const p = getPathFromGroups(groups);
        if (!p) continue;
        const abs = resolveSpecifierToId(files, id, p);
        if (!abs) continue;
        if (!memberSet.has(abs)) continue;
        // Place dependency before dependent: edge abs -> id
        if (!adj.get(abs)!.has(id)) {
          adj.get(abs)!.add(id);
          indegree.set(id, (indegree.get(id) ?? 0) + 1);
        }
      }
    };
    // Consider any value import (default, namespace, named) and type-only named imports
    addDeps(IMPORT_FROM_ANY);
    addDeps(IMPORT_TYPE_NAMED);
  }
  // Kahn's algorithm with lexical tie-breaker for determinism
  const queue: string[] = [];
  for (const id of memberIds) {
    if ((indegree.get(id) ?? 0) === 0) {
      queue.push(id);
    }
  }
  queue.sort((a, b) => a.localeCompare(b));
  const ordered: string[] = [];
  while (queue.length > 0) {
    const cur = queue.shift();
    if (!cur) break;
    ordered.push(cur);
    const neighbors = Array.from(adj.get(cur) ?? []);
    neighbors.sort((a, b) => a.localeCompare(b));
    for (const nb of neighbors) {
      const nextDeg = (indegree.get(nb) ?? 0) - 1;
      indegree.set(nb, nextDeg);
      if (nextDeg === 0) {
        // Insert maintaining lexical order
        let inserted = false;
        for (let i = 0; i < queue.length; i++) {
          if (nb.localeCompare(queue[i]!) < 0) {
            queue.splice(i, 0, nb);
            inserted = true;
            break;
          }
        }
        if (!inserted) {
          queue.push(nb);
        }
      }
    }
  }
  if (ordered.length !== memberIds.length) {
    // Cycle detected; fall back to lexicographic
    return [...memberIds].sort((a, b) => a.localeCompare(b));
  }
  return ordered;
}

/**
 * Remove named import declarations that target other members of the same group.
 * Leaves default/namespace/side-effect imports intact.
 */
function stripInternalNamedImports(
  files: Record<string, SourceFile>,
  fromId: string,
  content: string,
  groupIds: Set<string>,
) {
  let body = content;
  const removeFor = (pattern: RegExp) => {
    body = body.replace(pattern, (match, ...args) => {
      const groups = args.at(-1) as RegExpExecArray["groups"];
      const spec = getPathFromGroups(groups);
      if (!spec) return match;
      const abs = resolveSpecifierToId(files, fromId, spec);
      if (!abs) return match;
      if (!groupIds.has(abs)) return match;
      // Remove declaration; stray semicolon cleanup will handle leftover ';' lines
      return "";
    });
  };
  // Remove any internal import declarations (named, type-only, default, namespace, side-effect)
  removeFor(IMPORT_TYPE_NAMED);
  removeFor(IMPORT_NAMED);
  removeFor(IMPORT_FROM_ANY);
  removeFor(IMPORT_SIDE_EFFECT);
  // Clean up and collapse excessive blank lines
  body = collapseExcessBlankLines(cleanSemicolonOnlyLines(body));
  return body;
}

/**
 * Merge styles arrays, deduplicating by identity of type+name+module+import.
 */
function mergeStyles(
  ...lists: Array<StyleDependency[] | undefined>
): StyleDependency[] | undefined {
  const acc: StyleDependency[] = [];
  const seen = new Set<string>();
  const idOf = (d: StyleDependency) =>
    `${d.type}:${d.name}:${d.module ?? ""}:${d.import ?? ""}`;
  for (const list of lists) {
    if (!list) continue;
    for (const dep of list) {
      const key = idOf(dep);
      if (seen.has(key)) continue;
      seen.add(key);
      acc.push(dep);
    }
  }
  return acc.length ? acc : undefined;
}

/**
 * Merge dependency maps, preserving first-seen version on conflicts.
 */
function mergeDepMaps(
  ...maps: Array<Record<string, string> | undefined>
): Record<string, string> | undefined {
  const result: Record<string, string> = {};
  for (const m of maps) {
    if (!m) continue;
    for (const [k, v] of Object.entries(m)) {
      if (result[k] != null) continue;
      result[k] = v;
    }
  }
  return Object.keys(result).length ? result : undefined;
}

/**
 * Hoists import declarations to the top of the content.
 */
export function hoistImports(content: string) {
  const imports = new Set<string>();
  let body = content;

  const extract = (pattern: RegExp) => {
    body = body.replace(pattern, (match, ...args) => {
      const offset = (args.at(-3) as number) ?? 0;
      const full = (args.at(-2) as string) ?? body;

      let stmt = match;
      if (full[offset + match.length] === ";") {
        stmt += ";";
      }
      imports.add(stmt);
      return "";
    });
  };

  extract(IMPORT_SIDE_EFFECT);
  extract(IMPORT_TYPE_NAMED);
  extract(IMPORT_FROM_ANY);

  body = cleanSemicolonOnlyLines(body);
  body = collapseExcessBlankLines(body);

  if (imports.size === 0) return content;

  return `${sortKeys(imports).join("\n")}\n\n${body.trimStart()}`;
}

/**
 * Merges related files into grouped targets and rewrites named imports to point
 * at the merged output when appropriate. By default groups files by their
 * parent directory (directories with 2+ files produce `<dir>.ts`).
 */
export function mergeFiles(
  files: Record<string, SourceFile>,
  filter?: (path: string) => string | boolean,
): Record<string, SourceFile> {
  /**
   * Build grouping: map each file id to a target merged id, or null to keep as-is.
   */
  const targetById = new Map<string, string | null>();
  if (filter) {
    for (const id of Object.keys(files)) {
      const next = filter(id);
      if (next && typeof next === "string") {
        targetById.set(id, next);
      } else {
        targetById.set(id, null);
      }
    }
  } else {
    // Default: group by parent directory; merge directories with 2+ files into <dir>.ts
    const byDir = new Map<string, string[]>();
    for (const id of Object.keys(files)) {
      const dir = dirname(id);
      if (!byDir.has(dir)) {
        byDir.set(dir, []);
      }
      byDir.get(dir)!.push(id);
    }
    for (const [dir, ids] of byDir) {
      if (ids.length >= 2) {
        const target = `${dir}.ts`;
        for (const id of ids) {
          targetById.set(id, target);
        }
      } else {
        for (const id of ids) {
          targetById.set(id, null);
        }
      }
    }
  }

  /**
   * Build members by target id for groups to merge.
   */
  const membersByTarget = new Map<string, string[]>();
  for (const [id, tgt] of targetById) {
    if (!tgt) continue;
    if (!membersByTarget.has(tgt)) {
      membersByTarget.set(tgt, []);
    }
    membersByTarget.get(tgt)!.push(id);
  }
  // Ensure deterministic ordering of members per group
  for (const ids of membersByTarget.values()) {
    ids.sort((a, b) => a.localeCompare(b));
  }

  const result: Record<string, SourceFile> = {};

  // We'll collect merged groups after processing non-merged files to match expected order
  const mergedGroups: Array<{
    target: string;
    content: string;
    styles?: StyleDependency[];
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  }> = [];
  for (const [target, memberIds] of membersByTarget) {
    const order = topoOrderGroup(files, memberIds);
    const groupSet = new Set(memberIds);
    const parts: string[] = [];
    for (let i = 0; i < order.length; i++) {
      const id = order[i]!;
      const file = files[id];
      if (!file) continue;
      let stripped = stripInternalNamedImports(
        files,
        id,
        file.content,
        groupSet,
      );
      stripped = i === 0 ? stripped.trimEnd() : stripped.trimStart().trimEnd();
      parts.push(stripped);
    }
    // Merge styles/deps using lexical member order for deterministic union
    let mergedStyles: StyleDependency[] | undefined;
    let mergedDeps: Record<string, string> | undefined;
    let mergedDevDeps: Record<string, string> | undefined;
    const stylesOrder = [...memberIds].sort((a, b) => a.localeCompare(b));
    for (const id of stylesOrder) {
      const file = files[id];
      if (!file) continue;
      mergedStyles = mergeStyles(mergedStyles, file.styles);
      mergedDeps = mergeDepMaps(mergedDeps, file.dependencies);
      mergedDevDeps = mergeDepMaps(mergedDevDeps, file.devDependencies);
    }
    const content = `${parts.join("\n\n").trimEnd()}\n`;
    const hoistedContent = hoistImports(content);
    mergedGroups.push({
      target,
      content: hoistedContent,
      styles: mergedStyles,
      dependencies: mergedDeps,
      devDependencies: mergedDevDeps,
    });
  }

  // Then, add non-merged files, rewriting named imports that point to merged groups
  for (const [id, file] of Object.entries(files)) {
    if (targetById.get(id)) continue; // Skip files that were merged into a group
    const dir = dirname(id);
    const rewritten = mergeImports(file.content, (p, _t) => {
      // Only named (type/value) imports are processed by mergeImports; return false by default
      const abs = resolveSpecifierToId(files, id, p);
      if (!abs) return false;
      const target = targetById.get(abs);
      if (!target) return false;
      const rel = relative(dir, target).replace(/\\/g, "/");
      // Ensure relative paths start with ./ or ../
      const normalized = rel.startsWith(".") ? rel : `./${rel}`;
      return normalized;
    });
    result[id] = {
      id,
      content: rewritten,
      styles: file.styles,
      dependencies: file.dependencies,
      devDependencies: file.devDependencies,
    };
  }

  // Finally, append merged groups so their keys come last deterministically
  mergedGroups.sort((a, b) => a.target.localeCompare(b.target));
  for (const g of mergedGroups) {
    result[g.target] = {
      id: g.target,
      content: g.content,
      styles: g.styles,
      dependencies: g.dependencies,
      devDependencies: g.devDependencies,
    };
  }

  return result;
}

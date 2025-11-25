/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

import styles from "#app/styles/styles.json" with { type: "json" };

export type StyleType = "utility" | "variant" | "at-property";

export interface StyleDependency {
  type: StyleType;
  name: string;
  module?: string;
  import?: string;
}

export interface PropertyDecl {
  name: string;
  value: string | PropertyDecl[] | Record<string, never>;
}

export interface AtPropertyDef {
  name: string;
  syntax: string | null;
  inherits: string | null;
  initialValue: string | null;
}

export interface UtilityDef {
  name: string;
  type: "utility";
  properties: PropertyDecl[];
  dependencies: StyleDependency[];
}

export interface VariantDef {
  name: string;
  type: "variant";
  properties: PropertyDecl[];
  dependencies: StyleDependency[];
}

export type StyleDef = UtilityDef | VariantDef | AtPropertyDef;

export interface ModuleJson {
  id: string;
  path: string;
  atProperties: Record<string, AtPropertyDef>;
  utilities: Record<string, UtilityDef>;
  variants: Record<string, VariantDef>;
}

export interface StylesJson {
  version: number;
  modules: ModuleJson[];
  index: {
    utilities: Record<string, { module: string }>;
    variants: Record<string, { module: string }>;
    atProperties: Record<string, { module: string }>;
  };
}

/**
 * Cache module lookups to avoid repeated scans.
 */
const moduleById = new Map<string, ModuleJson>();

function ensureModuleCache() {
  if (moduleById.size) return;
  for (const mod of styles.modules) {
    moduleById.set(mod.id, mod);
  }
}

function getModuleById(id: string): ModuleJson | null {
  ensureModuleCache();
  return moduleById.get(id) ?? null;
}

function dependencyIdentity(dep: StyleDependency): string {
  const moduleId = dep.module ?? "";
  const importId = dep.import ?? "";
  return `${dep.type}:${dep.name}:${moduleId}:${importId}`;
}

function dedupeDependencies(deps: StyleDependency[]): StyleDependency[] {
  const seen = new Set<string>();
  const unique: StyleDependency[] = [];
  for (const dep of deps) {
    const key = dependencyIdentity(dep);
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(dep);
  }
  return unique;
}

function isWildcard(name: string): boolean {
  return name.includes("*");
}

function escapeRegexSpecialChars(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function toRegexFromWildcard(pattern: string): RegExp {
  // Build regex by escaping each char except '*' which becomes '.*'
  let regexBody = "";
  for (let i = 0; i < pattern.length; i++) {
    const ch = pattern.charAt(i);
    if (ch === "*") {
      regexBody += ".*";
    } else {
      regexBody += escapeRegexSpecialChars(ch);
    }
  }
  return new RegExp(`^${regexBody}$`);
}

type IndexMap = Record<string, { module: string }>;

const wildcardCache = {
  utilities: null as null | Array<{ key: string; module: string; re: RegExp }>,
  variants: null as null | Array<{ key: string; module: string; re: RegExp }>,
};

function getWildcardIndex(type: Exclude<StyleType, "at-property">) {
  if (type === "utility") {
    if (!wildcardCache.utilities) {
      const out: Array<{ key: string; module: string; re: RegExp }> = [];
      for (const [key, value] of Object.entries(styles.index.utilities)) {
        if (!isWildcard(key)) continue;
        out.push({ key, module: value.module, re: toRegexFromWildcard(key) });
      }
      wildcardCache.utilities = out;
    }
    return wildcardCache.utilities;
  }
  if (!wildcardCache.variants) {
    const out: Array<{ key: string; module: string; re: RegExp }> = [];
    for (const [key, value] of Object.entries(styles.index.variants)) {
      if (!isWildcard(key)) continue;
      out.push({ key, module: value.module, re: toRegexFromWildcard(key) });
    }
    wildcardCache.variants = out;
  }
  return wildcardCache.variants;
}

function getIndexMap(type: StyleType): IndexMap {
  if (type === "utility") return styles.index.utilities;
  if (type === "variant") return styles.index.variants;
  return styles.index.atProperties;
}

/**
 * Scan ak-* tokens in multiple files.
 */
export function scanAkTokens(...contents: string[]): Set<string> {
  const tokens = new Set<string>();
  const re = /ak-(?:\[[^\]]*\]|[^\s"'`])+/g;
  for (const content of contents) {
    if (!content) continue;
    let match: RegExpExecArray | null;
    // eslint-disable-next-line no-cond-assign
    while ((match = re.exec(content)) !== null) {
      const token = match[0];
      if (!token) continue;
      // Split non-bracket tokens on ':' to capture group-/peer- prefixed forms
      // like "group-ak-command-disabled:ak-badge" → ["ak-command-disabled",
      // "ak-badge"]
      const parts = token.split(":");
      for (const part of parts) {
        if (part.startsWith("ak-")) {
          tokens.add(part);
        }
      }
    }
  }
  return tokens;
}

/**
 * Find a dependency entry in the global index (no external fallbacks).
 */
export function findStyleDependency(
  name: string,
  type: StyleType,
): StyleDependency | null {
  const map = getIndexMap(type);
  const entry = map[name];
  if (!entry) return null;
  return { type, name, module: entry.module };
}

/**
 * Get the style definition from its module.
 */
export function getStyleDefinition(
  name: string,
  type: "utility",
): UtilityDef | null;
export function getStyleDefinition(
  name: string,
  type: "variant",
): VariantDef | null;
export function getStyleDefinition(
  name: string,
  type: "at-property",
): AtPropertyDef | null;
export function getStyleDefinition(
  name: string,
  type: StyleType,
): StyleDef | null;
export function getStyleDefinition(
  name: string,
  type: StyleType,
): StyleDef | null {
  const map = getIndexMap(type);
  const exact = map[name];
  if (exact) {
    const mod = getModuleById(exact.module);
    if (!mod) return null;
    if (type === "utility") return mod.utilities[name] ?? null;
    if (type === "variant") return mod.variants[name] ?? null;
    return mod.atProperties[name] ?? null;
  }

  if (type === "at-property") return null;

  // Fallback: try wildcard keys matching the given name using the index
  const wildcardIndex = getWildcardIndex(type);
  let best: { key: string; module: string } | null = null;
  for (const entry of wildcardIndex) {
    if (!entry.re.test(name)) continue;
    if (!best || entry.key.length > best.key.length) {
      best = { key: entry.key, module: entry.module };
    }
  }
  if (!best) return null;
  const mod = getModuleById(best.module);
  if (!mod) return null;
  if (type === "utility") return mod.utilities[best.key] ?? null;
  return mod.variants[best.key] ?? null;
}

/**
 * Collect transitive style definitions reachable from input.
 */
export function getTransitiveStyleDefinitions(
  input: StyleDependency,
): StyleDef[] {
  const out: StyleDef[] = [];
  const queue: StyleDependency[] = [];
  const visited = new Set<string>();

  const rootDef = getStyleDefinition(input.name, input.type);
  if (!rootDef) return out;
  const enqueueDeps = (def: StyleDef) => {
    if (!("type" in def)) return;
    for (const dep of def.dependencies) {
      const modId = dep.module ?? "";
      const k = `${dep.type}:${modId}:${dep.name}`;
      if (visited.has(k)) continue;
      const depDef = getStyleDefinition(dep.name, dep.type);
      if (!depDef) {
        visited.add(k);
        continue;
      }
      visited.add(k);
      out.push(depDef);
      queue.push(dep);
    }
  };

  enqueueDeps(rootDef);
  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;
    const def = getStyleDefinition(current.name, current.type);
    if (!def) continue;
    enqueueDeps(def);
  }
  return out;
}

/**
 * Collect transitive dependencies reachable from input (BFS). Root is excluded.
 */
export function getTransitiveDependencies(
  input: StyleDependency,
): StyleDependency[] {
  const out: StyleDependency[] = [];
  const queue: StyleDependency[] = [];
  const seenDep = new Set<string>();
  const visitedDef = new Set<string>();

  const rootDef = getStyleDefinition(input.name, input.type);
  if (!rootDef) return out;

  const markDep = (dep: StyleDependency) => {
    const key = dependencyIdentity(dep);
    if (seenDep.has(key)) return false;
    seenDep.add(key);
    out.push(dep);
    return true;
  };

  const enqueueDeps = (def: StyleDef) => {
    if (!("type" in def)) return;
    for (const dep of def.dependencies) {
      const didAdd = markDep(dep);
      if (!didAdd) continue;
      const modId = dep.module ?? "";
      const k = `${dep.type}:${modId}:${dep.name}`;
      if (visitedDef.has(k)) continue;
      const depDef = getStyleDefinition(dep.name, dep.type);
      if (!depDef) continue;
      visitedDef.add(k);
      queue.push(dep);
    }
  };

  // Seed with root
  const rootKey = `${input.type}:${input.module ?? ""}:${input.name}`;
  visitedDef.add(rootKey);
  enqueueDeps(rootDef);

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) break;
    const def = getStyleDefinition(current.name, current.type);
    if (!def) continue;
    enqueueDeps(def);
  }
  return out;
}

function resolveWildcardBaseDeps(
  token: string,
  type: Exclude<StyleType, "at-property">,
): StyleDependency[] {
  const wildcardIndex = getWildcardIndex(type);
  const bestByModule = new Map<string, { key: string; module: string }>();
  for (const entry of wildcardIndex) {
    if (!entry.re.test(token)) continue;
    const existing = bestByModule.get(entry.module);
    if (!existing || entry.key.length > existing.key.length) {
      bestByModule.set(entry.module, { key: entry.key, module: entry.module });
    }
  }
  const out: StyleDependency[] = [];
  for (const { key, module } of bestByModule.values()) {
    out.push({ type, name: key, module });
  }
  return out;
}

/**
 * Resolve base dependencies for a single ak-* token.
 */
export function resolveDependenciesForAkToken(name: string): StyleDependency[] {
  const out: StyleDependency[] = [];

  const utilExact = findStyleDependency(name, "utility");
  if (utilExact) {
    out.push(utilExact);
  }
  const varExact = findStyleDependency(name, "variant");
  if (varExact) {
    out.push(varExact);
  }

  // Wildcards: select most specific per (type, module)
  out.push(...resolveWildcardBaseDeps(name, "utility"));
  out.push(...resolveWildcardBaseDeps(name, "variant"));

  return dedupeDependencies(out);
}

/**
 * Resolve direct styles for a collection of files. This does not include
 * transitive dependencies.
 */
export function resolveDirectStyles(...contents: string[]) {
  const tokens = scanAkTokens(...contents);
  return dedupeDependencies([...tokens].flatMap(resolveDependenciesForAkToken));
}

/**
 * Resolve styles for a collection of files. This includes transitive
 * dependencies.
 */
export function resolveStyles(...contents: string[]): StyleDependency[] {
  const directDeps = resolveDirectStyles(...contents);
  return dedupeDependencies([
    ...directDeps,
    ...directDeps.flatMap(getTransitiveDependencies),
  ]);
}

/**
 * Convert a property declaration tree to a CSS string.
 */
function renderPropertyDecls(decls: PropertyDecl[], indentLevel = 0): string {
  const indent = (n: number) => "  ".repeat(n);
  const lines: string[] = [];
  for (const decl of decls) {
    if (Array.isArray(decl.value)) {
      // Nested block
      lines.push(`${indent(indentLevel)}${decl.name} {`);
      const inner = renderPropertyDecls(decl.value, indentLevel + 1);
      if (inner) {
        lines.push(inner);
      }
      lines.push(`${indent(indentLevel)}}`);
      continue;
    }
    const name = decl.name;
    if (!name) continue;
    // Comments
    if (name.startsWith("/*") && name.endsWith("*/")) {
      // Raw comment preserved as its own line
      lines.push(`${indent(indentLevel)}${name}`);
      continue;
    }
    // String value: standard CSS declaration
    if (typeof decl.value === "string") {
      const value = decl.value;
      lines.push(`${indent(indentLevel)}${name}: ${value};`);
      continue;
    }
    // Generic valueless declaration: emit as a single statement
    lines.push(`${indent(indentLevel)}${name};`);
  }
  return lines.join("\n");
}

/**
 * Convert a style definition into a CSS string using the DSL at-rules:
 * - @property for custom properties
 * - @utility for utilities
 * - @custom-variant for variants
 */
export function styleDefToCss(def: StyleDef): string {
  if ("type" in def) {
    if (def.type === "utility") {
      const body = renderPropertyDecls(def.properties, 1);
      if (!body) {
        return `@utility ${def.name} {}`;
      }
      return `@utility ${def.name} {\n${body}\n}`;
    }
    // variant
    const body = renderPropertyDecls(def.properties, 1);
    if (!body) {
      return `@custom-variant ${def.name} {}`;
    }
    return `@custom-variant ${def.name} {\n${body}\n}`;
  }
  // @property
  const lines: string[] = [];
  if (def.syntax != null) {
    lines.push(`  syntax: ${def.syntax};`);
  }
  if (def.inherits != null) {
    lines.push(`  inherits: ${def.inherits};`);
  }
  if (def.initialValue != null) {
    lines.push(`  initial-value: ${def.initialValue};`);
  }
  const inner = lines.join("\n");
  if (!inner) {
    return `@property ${def.name} {}`;
  }
  return `@property ${def.name} {\n${inner}\n}`;
}

export function styleDefsToCss(defs: StyleDef[]): string {
  return `${defs.map(styleDefToCss).join("\n\n").trimEnd()}\n`;
}

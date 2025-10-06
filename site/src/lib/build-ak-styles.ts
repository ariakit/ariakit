/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

import * as fs from "node:fs/promises";
import * as path from "node:path";

interface SourceRange {
  file: string;
  start: number;
  end: number;
}

interface AtPropertyDef {
  name: string;
  syntax: string | null;
  inherits: boolean | null;
  initialValue: string | null;
  sources: SourceRange[];
}

// PropertiesMap is a mixed map: declarations (prop: value), comments, arrays
// for @apply, and nested blocks
type PropertiesMap = {
  [key: string]: string | string[] | PropertiesMap;
};

type DependencyType = "utility" | "variant" | "at-property";

interface Dependency {
  type: DependencyType;
  name: string;
  module?: string;
  import?: string;
}

interface UtilityDef {
  name: string;
  type: "utility";
  properties: PropertiesMap;
  dependencies: Dependency[];
  sources: SourceRange[];
}

interface VariantDef {
  name: string;
  type: "variant";
  properties: PropertiesMap;
  dependencies: Dependency[];
  sources: SourceRange[];
}

interface ModuleJson {
  id: string;
  path: string;
  atProperties: Record<string, AtPropertyDef>;
  utilities: Record<string, UtilityDef>;
  variants: Record<string, VariantDef>;
}

interface StyleIndexJson {
  version: number;
  generatedAt: string;
  modules: ModuleJson[];
  index: {
    utilities: Record<string, { module: string }>;
    variants: Record<string, { module: string }>;
    atProperties: Record<string, { module: string }>;
  };
}

// Files and discovery
const STYLES_DIR = path.resolve(process.cwd(), "site/src/styles");
const ARIAKIT_CSS = path.join(STYLES_DIR, "ariakit.css");
const OUTPUT_JSON = path.join(STYLES_DIR, "styles.json");

// Utility helpers
function toPosix(p: string) {
  return p.split(path.sep).join("/");
}

function toProjectRelativePosix(p: string) {
  const rel = path.relative(process.cwd(), p);
  return toPosix(rel);
}

function stripLineComments(s: string) {
  // Remove /* ... */ while preserving line count by keeping newlines
  return s.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ""));
}

function getLineAtOffset(text: string, offset: number) {
  let line = 1;
  for (let i = 0; i < offset && i < text.length; i++) {
    if (text.charCodeAt(i) === 10) line++;
  }
  return line;
}

function uniqPreserveOrder<T>(arr: T[]) {
  const seen = new Set<T>();
  const out: T[] = [];
  for (const item of arr) {
    if (seen.has(item)) continue;
    seen.add(item);
    out.push(item);
  }
  return out;
}

/**
 * Minimal CSS block extraction for our custom DSL
 */
interface ExtractedBlock {
  kind: "utility" | "custom-variant" | "property";
  // utility/variant name or variable name for @property
  name: string;
  body: string;
  startLine: number;
  endLine: number;
}

async function readFileText(filePath: string) {
  const text = await fs.readFile(filePath, "utf8");
  return text;
}

function findMatchingBrace(text: string, openIndex: number) {
  let depth = 0;
  let i = openIndex;
  let inStr: false | string = false;
  let inComment = false;
  while (i < text.length) {
    const ch = text[i]!;
    const next = text[i + 1];
    if (inComment) {
      if (ch === "*" && next === "/") {
        inComment = false;
        i += 2;
        continue;
      }
      i++;
      continue;
    }
    if (inStr) {
      if (ch === "\\") {
        i += 2;
        continue;
      }
      if (ch === inStr) inStr = false;
      i++;
      continue;
    }
    if (ch === "/" && next === "*") {
      inComment = true;
      i += 2;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      inStr = ch;
      i++;
      continue;
    }
    if (ch === "{") depth++;
    if (ch === "}") {
      depth--;
      if (depth === 0) return i;
    }
    i++;
  }
  return -1;
}

function extractTopLevelBlocks(
  _filePath: string,
  rawCss: string,
): ExtractedBlock[] {
  const blocks: ExtractedBlock[] = [];
  let i = 0;
  const n = rawCss.length;
  let inStr: false | string = false;
  let inComment = false;
  while (i < n) {
    const ch = rawCss[i]!;
    const next = rawCss[i + 1];
    if (inComment) {
      if (ch === "*" && next === "/") {
        inComment = false;
        i += 2;
        continue;
      }
      i++;
      continue;
    }
    if (inStr) {
      if (ch === "\\") {
        i += 2;
        continue;
      }
      if (ch === inStr) inStr = false;
      i++;
      continue;
    }
    if (ch === "/" && next === "*") {
      inComment = true;
      i += 2;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      inStr = ch;
      i++;
      continue;
    }
    // detect at-rule starts
    if (ch === "@") {
      const slice = rawCss.slice(i);
      let kind: ExtractedBlock["kind"] | null = null;
      let nameMatch: RegExpExecArray | null = null;
      if (slice.startsWith("@utility")) {
        kind = "utility";
        nameMatch = /^@utility\s+([A-Za-z0-9_\-*]+)/.exec(slice);
      } else if (slice.startsWith("@custom-variant")) {
        kind = "custom-variant";
        nameMatch = /^@custom-variant\s+([A-Za-z0-9_\-*]+)/.exec(slice);
      } else if (slice.startsWith("@property")) {
        kind = "property";
        nameMatch = /^@property\s+(--[A-Za-z0-9_-]+)/.exec(slice);
      }
      if (kind && nameMatch) {
        const name = nameMatch[1]!;
        // advance to first '{' after skipping whitespace/comments
        let j = i + nameMatch[0]!.length;
        while (j < n) {
          const cj = rawCss[j]!;
          const nj = rawCss[j + 1];
          if (/\s/.test(cj)) {
            j++;
            continue;
          }
          if (cj === "/" && nj === "*") {
            // skip comment
            const end = rawCss.indexOf("*/", j + 2);
            j = end === -1 ? n : end + 2;
            continue;
          }
          if (cj === "{") break;
          // unexpected token, abort this at-rule parse
          break;
        }
        if (rawCss[j] !== "{") {
          i++;
          continue;
        }
        const braceOpen = j;
        const braceClose = findMatchingBrace(rawCss, braceOpen);
        if (braceClose === -1) {
          i++;
          continue;
        }
        const body = rawCss.slice(braceOpen + 1, braceClose);
        const startLine = getLineAtOffset(rawCss, i);
        const endLine = getLineAtOffset(rawCss, braceClose);
        blocks.push({ kind, name, body, startLine, endLine });
        i = braceClose + 1;
        continue;
      }
    }
    i++;
  }
  return blocks;
}

/**
 * Statement splitter (depth-0 level):
 * - declarations ended by ';'
 * - nested blocks headed by "<header>{...}"
 */
interface SplitBodyResult {
  declarations: string[]; // raw statements without trailing semicolon (include comments as separate items)
  blocks: { header: string; body: string }[];
}

function splitBody(content: string): SplitBodyResult {
  const declarations: string[] = [];
  const blocks: { header: string; body: string }[] = [];
  let i = 0;
  const n = content.length;
  let tokenStart = 0;
  let depth = 0;
  let inStr: false | string = false;
  while (i < n) {
    const ch = content[i]!;
    const next = content[i + 1];
    if (inStr) {
      if (ch === "\\") {
        i += 2;
        continue;
      }
      if (ch === inStr) {
        inStr = false;
      }
      i++;
      continue;
    }
    // capture comments at depth 0 as individual declarations
    if (ch === "/" && next === "*" && depth === 0) {
      const pending = content.slice(tokenStart, i).trim();
      if (pending) declarations.push(pending);
      const end = content.indexOf("*/", i + 2);
      const commentEnd = end === -1 ? n - 2 : end;
      const comment = content.slice(i, commentEnd + 2);
      declarations.push(comment);
      i = commentEnd + 2;
      tokenStart = i;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      inStr = ch;
      i++;
      continue;
    }
    if (ch === "{") {
      if (depth === 0) {
        // Header is content[tokenStart..i)
        const header = content.slice(tokenStart, i).trim();
        const braceOpen = i;
        const braceClose = findMatchingBrace(content, braceOpen);
        if (braceClose === -1) break;
        const body = content.slice(braceOpen + 1, braceClose);
        blocks.push({ header, body });
        // Move after closing brace
        i = braceClose + 1;
        tokenStart = i;
        continue;
      }
      depth++;
      i++;
      continue;
    }
    if (ch === "}") {
      depth = Math.max(0, depth - 1);
      i++;
      continue;
    }
    if (ch === ";" && depth === 0) {
      const stmt = content.slice(tokenStart, i).trim();
      if (stmt) {
        declarations.push(stmt);
      }
      i++;
      tokenStart = i;
      continue;
    }
    i++;
  }
  // Trailing declaration without semicolon
  const tail = content.slice(tokenStart).trim();
  if (tail) {
    declarations.push(tail);
  }
  return { declarations, blocks };
}

/**
 * Parse declarations into apply lines, custom properties, and non-custom props
 */
interface ParsedDecls {
  applyLines: string[];
  customProps: Record<string, string>;
  nonCustomProps: Record<string, string>;
}

function parseDeclarations(statements: string[]): ParsedDecls {
  const applyLines: string[] = [];
  const customProps: Record<string, string> = {};
  const nonCustomProps: Record<string, string> = {};
  let pendingApplyComments: string[] = [];
  for (const stmt of statements) {
    const s = stmt.trim();
    if (!s) continue;
    if (s.startsWith("/*") && s.endsWith("*/")) {
      // Defer placing comment: attach to next @apply if present; otherwise
      // we'll flush it into nonCustomProps when a non-apply declaration appears
      // or at the end
      pendingApplyComments.push(s);
      continue;
    }
    if (s.startsWith("@apply ")) {
      const raw = s.replace(/^@apply\s+/, "");
      if (pendingApplyComments.length) {
        for (const c of pendingApplyComments) applyLines.push(c);
        pendingApplyComments = [];
      }
      applyLines.push(raw);
      continue;
    }
    // Any non-apply declaration flushes pending comments into properties
    if (pendingApplyComments.length) {
      for (const c of pendingApplyComments) {
        nonCustomProps[c] = "";
      }
      pendingApplyComments = [];
    }
    // @slot;
    if (s === "@slot") {
      nonCustomProps["@slot"] = "";
      continue;
    }
    const colon = s.indexOf(":");
    if (colon > 0) {
      const prop = s.slice(0, colon).trim();
      const value = s.slice(colon + 1).trim();
      if (prop.startsWith("--")) {
        customProps[prop] = value;
      } else {
        nonCustomProps[prop] = value;
      }
    }
  }
  // Flush any trailing comments that were not attached to an @apply
  if (pendingApplyComments.length) {
    for (const c of pendingApplyComments) {
      nonCustomProps[c] = "";
    }
    pendingApplyComments = [];
  }
  return { applyLines, customProps, nonCustomProps };
}

/**
 * Recursive parse of a block body into a NestedRuleNode
 */
function parseNestedRule(body: string): PropertiesMap {
  const { declarations, blocks } = splitBody(body);
  const { applyLines, customProps, nonCustomProps } =
    parseDeclarations(declarations);
  const propsMap: PropertiesMap = {};
  if (applyLines.length) propsMap["@apply"] = applyLines;
  for (const [prop, value] of Object.entries(customProps)) {
    propsMap[prop] = value;
  }
  for (const [prop, value] of Object.entries(nonCustomProps)) {
    propsMap[prop] = value;
  }
  for (const { header, body: childBody } of blocks) {
    const hdr = header.trim();
    propsMap[hdr] = parseNestedRule(childBody);
  }
  return propsMap;
}

/**
 * Parse @property block body
 */
function parseAtPropertyBody(body: string) {
  const { declarations } = splitBody(body);
  const def: {
    syntax: string | null;
    inherits: boolean | null;
    initial: string | null;
  } = {
    syntax: null,
    inherits: null,
    initial: null,
  };
  for (const stmt of declarations) {
    const s = stmt.trim();
    const colon = s.indexOf(":");
    if (colon <= 0) continue;
    const key = s.slice(0, colon).trim();
    const value = s.slice(colon + 1).trim();
    if (key === "syntax") {
      def.syntax = value.replace(/^"|"$/g, "");
    } else if (key === "inherits") {
      def.inherits = /true/i.test(value);
    } else if (key === "initial-value") {
      def.initial = value;
    }
  }
  return def;
}

/**
 * Module parsing
 */
async function parseStyleModule(modulePath: string): Promise<ModuleJson> {
  const raw = await readFileText(modulePath);
  const blocks = extractTopLevelBlocks(modulePath, raw);
  const atProperties: Record<string, AtPropertyDef> = {};
  const utilities: Record<string, UtilityDef> = {};
  const variants: Record<string, VariantDef> = {};

  for (const block of blocks) {
    if (block.kind === "property") {
      const parsed = parseAtPropertyBody(block.body);
      atProperties[block.name] = {
        name: block.name,
        syntax: parsed.syntax,
        inherits: parsed.inherits,
        initialValue: parsed.initial,
        sources: [
          {
            file: toProjectRelativePosix(modulePath),
            start: block.startLine,
            end: block.endLine,
          },
        ],
      };
      continue;
    }
    if (block.kind === "utility") {
      const { declarations, blocks: childBlocks } = splitBody(block.body);
      const { applyLines, customProps, nonCustomProps } =
        parseDeclarations(declarations);
      const propsRoot: PropertiesMap = {};
      if (applyLines.length) propsRoot["@apply"] = applyLines;
      for (const [prop, value] of Object.entries(customProps)) {
        propsRoot[prop] = value;
      }
      for (const [prop, value] of Object.entries(nonCustomProps)) {
        propsRoot[prop] = value;
      }
      for (const child of childBlocks) {
        const hdr = child.header.trim();
        propsRoot[hdr] = parseNestedRule(child.body);
      }
      utilities[block.name] = {
        name: block.name,
        type: "utility",
        properties: propsRoot,
        dependencies: [],
        sources: [
          {
            file: toProjectRelativePosix(modulePath),
            start: block.startLine,
            end: block.endLine,
          },
        ],
      };
      continue;
    }
    if (block.kind === "custom-variant") {
      const variantRules = parseNestedRule(block.body) || {};
      variants[block.name] = {
        name: block.name,
        type: "variant",
        properties: variantRules,
        dependencies: [],
        sources: [
          {
            file: toProjectRelativePosix(modulePath),
            start: block.startLine,
            end: block.endLine,
          },
        ],
      };
    }
  }

  return {
    id: path
      .basename(modulePath)
      .replace(/^ak-|\.css$/g, (m) => (m === "ak-" ? "" : "")),
    path: toProjectRelativePosix(modulePath),
    atProperties,
    utilities,
    variants,
  };
}

/**
 * Discover modules via imports in ariakit.css
 */
async function discoverModulePaths(): Promise<string[]> {
  const raw = await readFileText(ARIAKIT_CSS);
  const css = stripLineComments(raw);
  const paths: string[] = [];
  const re = /@import\s+"\.\/(ak-[^"]+\.css)"\s*;/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(css))) {
    const rel = m[1]!;
    paths.push(path.join(STYLES_DIR, rel));
  }
  return paths;
}

/**
 * Dependency resolution
 */
interface GlobalIndex {
  utilToModule: Map<string, string>;
  variantToModule: Map<string, string>;
  atPropToModule: Map<string, string>;
}

function buildGlobalIndex(modules: ModuleJson[]): GlobalIndex {
  const utilToModule = new Map<string, string>();
  const variantToModule = new Map<string, string>();
  const atPropToModule = new Map<string, string>();
  for (const mod of modules) {
    for (const name of Object.keys(mod.utilities)) {
      utilToModule.set(name, mod.id);
    }
    for (const name of Object.keys(mod.variants)) {
      variantToModule.set(name, mod.id);
    }
    for (const name of Object.keys(mod.atProperties)) {
      atPropToModule.set(name, mod.id);
    }
  }
  return { utilToModule, variantToModule, atPropToModule };
}

function extractAkTokensFromApplyLine(line: string) {
  // Split by whitespace, keep original tokens
  const tokens = line.trim().split(/\s+/);
  const akTokens: string[] = [];
  for (const tok of tokens) {
    // Resolve last segment after colons as the actual utility,
    // keep any ak-* segments as potential variants or utilities
    const segments = tok.split(":");
    for (let i = 0; i < segments.length; i++) {
      const seg = segments[i]!;
      if (seg.startsWith("ak-")) {
        akTokens.push(seg);
      }
    }
  }
  return uniqPreserveOrder(akTokens);
}

function findVarNamesInString(value: string) {
  const out: string[] = [];
  const re = /var\(\s*(--[A-Za-z0-9_-]+)\b[^)]*\)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(value))) {
    out.push(m[1]!);
  }
  return uniqPreserveOrder(out);
}

function collectAllValuesFromPropertiesMap(props?: PropertiesMap): string[] {
  if (!props) return [];
  const out: string[] = [];
  for (const [, val] of Object.entries(props)) {
    if (typeof val === "string") {
      out.push(val);
      continue;
    }
    if (Array.isArray(val)) {
      out.push(...val);
      continue;
    }
    if (typeof val === "object") {
      out.push(...collectAllValuesFromPropertiesMap(val));
    }
  }
  return out;
}

function resolveDependencies(modules: ModuleJson[]): void {
  const index = buildGlobalIndex(modules);
  const externalImport = "@ariakit/tailwind";

  const addDep = (list: Dependency[], dep: Dependency) => {
    if (
      list.some(
        (d) =>
          d.type === dep.type &&
          d.name === dep.name &&
          d.module === dep.module &&
          d.import === dep.import,
      )
    ) {
      return;
    }
    list.push(dep);
  };

  for (const mod of modules) {
    for (const util of Object.values(mod.utilities)) {
      const deps: Dependency[] = [];
      const applyLines = Array.isArray(util.properties["@apply"])
        ? [...(util.properties["@apply"] as string[])]
        : [];
      // Collect nested apply lines and property values
      const nestedValues = collectAllValuesFromPropertiesMap(util.properties);
      for (const v of nestedValues) {
        // Any nested apply lines are stored as entire lines in val.apply; others are declarations
        // We still scan all strings for ak-* tokens
        const akTokens = extractAkTokensFromApplyLine(v);
        for (const t of akTokens) {
          if (index.utilToModule.has(t)) {
            addDep(deps, {
              type: "utility",
              name: t,
              module: index.utilToModule.get(t)!,
            });
          } else if (index.variantToModule.has(t)) {
            addDep(deps, {
              type: "variant",
              name: t,
              module: index.variantToModule.get(t)!,
            });
          } else if (t.startsWith("ak-")) {
            addDep(deps, { type: "utility", name: t, import: externalImport });
          }
        }
        // Also scan for var(--prop)
        for (const varName of findVarNamesInString(v)) {
          if (index.atPropToModule.has(varName)) {
            addDep(deps, {
              type: "at-property",
              name: varName,
              module: index.atPropToModule.get(varName)!,
            });
          }
        }
      }
      // Root-level apply lines
      for (const line of applyLines) {
        const akTokens = extractAkTokensFromApplyLine(line);
        for (const t of akTokens) {
          if (index.utilToModule.has(t)) {
            addDep(deps, {
              type: "utility",
              name: t,
              module: index.utilToModule.get(t)!,
            });
          } else if (index.variantToModule.has(t)) {
            addDep(deps, {
              type: "variant",
              name: t,
              module: index.variantToModule.get(t)!,
            });
          } else if (t.startsWith("ak-")) {
            addDep(deps, { type: "utility", name: t, import: externalImport });
          }
        }
        for (const varName of findVarNamesInString(line)) {
          if (index.atPropToModule.has(varName)) {
            addDep(deps, {
              type: "at-property",
              name: varName,
              module: index.atPropToModule.get(varName)!,
            });
          }
        }
      }
      // Root-level custom props: scan only string values
      for (const value of Object.values(util.properties)) {
        if (typeof value !== "string") continue;
        for (const varName of findVarNamesInString(value)) {
          if (index.atPropToModule.has(varName)) {
            addDep(deps, {
              type: "at-property",
              name: varName,
              module: index.atPropToModule.get(varName)!,
            });
          }
        }
      }
      util.dependencies = deps;
    }
    // Variants typically have no deps; leave empty unless their rules reference var() or ak-* tokens
    for (const variant of Object.values(mod.variants)) {
      const deps: Dependency[] = [];
      const values = collectAllValuesFromPropertiesMap(variant.properties);
      for (const v of values) {
        const akTokens = extractAkTokensFromApplyLine(v);
        for (const t of akTokens) {
          if (index.utilToModule.has(t))
            addDep(deps, {
              type: "utility",
              name: t,
              module: index.utilToModule.get(t)!,
            });
          else if (index.variantToModule.has(t))
            addDep(deps, {
              type: "variant",
              name: t,
              module: index.variantToModule.get(t)!,
            });
          else if (t.startsWith("ak-"))
            addDep(deps, { type: "utility", name: t, import: externalImport });
        }
        for (const varName of findVarNamesInString(v)) {
          if (index.atPropToModule.has(varName))
            addDep(deps, {
              type: "at-property",
              name: varName,
              module: index.atPropToModule.get(varName)!,
            });
        }
      }
      variant.dependencies = deps;
    }
  }
}

/**
 * Build global index section
 */
function buildIndexSection(modules: ModuleJson[]): StyleIndexJson["index"] {
  const utilities: Record<string, { module: string }> = {};
  const variants: Record<string, { module: string }> = {};
  const atProperties: Record<string, { module: string }> = {};
  for (const m of modules) {
    for (const k of Object.keys(m.utilities)) {
      utilities[k] = { module: m.id };
    }
    for (const k of Object.keys(m.variants)) {
      variants[k] = { module: m.id };
    }
    for (const k of Object.keys(m.atProperties)) {
      atProperties[k] = { module: m.id };
    }
  }
  return { utilities, variants, atProperties };
}

/**
 * Entry point
 */
export async function buildAkStylesIndex(outputPath: string = OUTPUT_JSON) {
  const modulePaths = await discoverModulePaths();
  const modules: ModuleJson[] = [];
  for (const p of modulePaths) {
    const mod = await parseStyleModule(p);
    modules.push(mod);
  }
  // Resolve dependencies after all modules are parsed
  resolveDependencies(modules);

  const json: StyleIndexJson = {
    version: 2,
    generatedAt: new Date().toISOString(),
    modules,
    index: buildIndexSection(modules),
  };

  await fs.writeFile(outputPath, `${JSON.stringify(json, null, 2)}\n`, "utf8");
  return outputPath;
}

// Allow running directly via ts-node or tsx
buildAkStylesIndex().then((out) => {
  console.log(`Wrote ${toPosix(out)}`);
});

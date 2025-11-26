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
import type {
  AtPropertyDef,
  ModuleJson,
  PropertyDecl,
  StyleDependency,
  StylesJson,
  UtilityDef,
  VariantDef,
} from "./styles.ts";

type Dependency = StyleDependency;

// Files and discovery
const ROOT_DIR = path.resolve(import.meta.dirname, "../../../");
const STYLES_DIR = path.resolve(ROOT_DIR, "site/src/styles");
const ARIAKIT_CSS = path.join(STYLES_DIR, "ariakit.css");
const OUTPUT_JSON = path.join(STYLES_DIR, "styles.json");

// Utility helpers
function toPosix(p: string) {
  return p.split(path.sep).join("/");
}

function toProjectRelativePosix(p: string) {
  const rel = path.relative(ROOT_DIR, p);
  return toPosix(rel);
}

function stripLineComments(s: string) {
  // Remove /* ... */ while preserving line count by keeping newlines
  return s.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ""));
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
    const ch = text.charAt(i);
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
      if (ch === inStr) {
        inStr = false;
      }
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
    if (ch === "{") {
      depth++;
    }
    if (ch === "}") {
      depth--;
      if (depth === 0) {
        return i;
      }
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
    const ch = rawCss.charAt(i);
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
      if (ch === inStr) {
        inStr = false;
      }
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
        const nameCaptured = nameMatch[1];
        if (!nameCaptured) {
          i++;
          continue;
        }
        const name = nameCaptured;
        // advance to first '{' after skipping whitespace/comments
        const prefix = nameMatch[0];
        if (!prefix) {
          i++;
          continue;
        }
        let j = i + prefix.length;
        while (j < n) {
          const cj = rawCss.charAt(j);
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
        blocks.push({ kind, name, body });
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
  // raw statements without trailing semicolon (include comments as separate
  // items)
  declarations: string[];
  blocks: { header: string; body: string }[];
  items: (
    | { kind: "decl"; content: string }
    | { kind: "block"; header: string; body: string }
  )[];
}

function splitBody(content: string): SplitBodyResult {
  const declarations: string[] = [];
  const blocks: { header: string; body: string }[] = [];
  const items: (
    | { kind: "decl"; content: string }
    | { kind: "block"; header: string; body: string }
  )[] = [];
  let i = 0;
  const n = content.length;
  let tokenStart = 0;
  let depth = 0;
  let inStr: false | string = false;
  while (i < n) {
    const ch = content.charAt(i);
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
      if (pending) {
        declarations.push(pending);
      }
      const end = content.indexOf("*/", i + 2);
      const commentEnd = end === -1 ? n - 2 : end;
      const comment = content.slice(i, commentEnd + 2);
      declarations.push(comment);
      items.push({ kind: "decl", content: comment });
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
        items.push({ kind: "block", header, body });
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
        items.push({ kind: "decl", content: stmt });
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
    items.push({ kind: "decl", content: tail });
  }
  return { declarations, blocks, items };
}

/**
 * Parse a block body into ordered PropertyDecl[] preserving declaration and block order.
 */
function parsePropertyDecls(body: string): PropertyDecl[] {
  const { items } = splitBody(body);
  const decls: PropertyDecl[] = [];
  let pendingApplyComments: string[] = [];

  const flushPendingComments = () => {
    if (!pendingApplyComments.length) return;
    for (const c of pendingApplyComments) {
      decls.push({ name: c, value: {} });
    }
    pendingApplyComments = [];
  };

  for (const item of items) {
    if (item.kind === "decl") {
      const s = item.content.trim();
      if (!s) continue;
      if (s.startsWith("/*") && s.endsWith("*/")) {
        pendingApplyComments.push(s);
        continue;
      }
      if (s.startsWith("@apply ")) {
        // Attach any pending comments immediately before @apply
        flushPendingComments();
        const raw = s.replace(/^@apply\s+/, "");
        // Store @apply as a valueless declaration with the full header on name
        // and an empty object as value. This preserves the exact token string
        // while normalizing the JSON shape for valueless declarations.
        decls.push({ name: `@apply ${raw}`, value: {} });
        continue;
      }
      // Any non-apply declaration flushes pending comments
      if (s === "@slot") {
        flushPendingComments();
        decls.push({ name: "@slot", value: {} });
        continue;
      }
      const colon = s.indexOf(":");
      if (colon > 0) {
        flushPendingComments();
        const prop = s.slice(0, colon).trim();
        const value = s.slice(colon + 1).trim();
        decls.push({ name: prop, value });
        continue;
      }
      // Fallback: keep raw as a named empty declaration
      flushPendingComments();
      decls.push({ name: s, value: {} });
      continue;
    }
    if (item.kind === "block") {
      flushPendingComments();
      const hdr = item.header.trim();
      const children = parsePropertyDecls(item.body);
      decls.push({ name: hdr, value: children });
    }
  }
  // Flush any trailing comments
  flushPendingComments();
  return decls;
}

/**
 * Parse @property block body
 */
function parseAtPropertyBody(body: string) {
  const { declarations } = splitBody(body);
  const def: Omit<AtPropertyDef, "name"> = {
    syntax: null,
    inherits: null,
    initialValue: null,
  };
  for (const stmt of declarations) {
    const s = stmt.trim();
    const colon = s.indexOf(":");
    if (colon <= 0) continue;
    const key = s.slice(0, colon).trim();
    const value = s.slice(colon + 1).trim();
    if (key === "syntax") {
      def.syntax = value;
    } else if (key === "initial-value") {
      def.initialValue = value;
    } else if (key in def) {
      def[key as keyof typeof def] = value;
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
      atProperties[block.name] = { name: block.name, ...parsed };
      continue;
    }
    if (block.kind === "utility") {
      const propsRoot = parsePropertyDecls(block.body);
      utilities[block.name] = {
        name: block.name,
        type: "utility",
        properties: propsRoot,
        dependencies: [],
      };
      continue;
    }
    if (block.kind === "custom-variant") {
      const variantRules = parsePropertyDecls(block.body);
      variants[block.name] = {
        name: block.name,
        type: "variant",
        properties: variantRules,
        dependencies: [],
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
  let match: RegExpExecArray | null;
  while (true) {
    match = re.exec(css);
    if (!match) break;
    const rel = match[1];
    if (!rel) {
      continue;
    }
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
      const seg = segments[i];
      if (!seg) {
        continue;
      }
      // Handle direct ak-* tokens
      if (seg.startsWith("ak-")) {
        akTokens.push(seg);
        continue;
      }
      // Tailwind not-* prefix support: normalize not-ak-* to ak-*
      // This may appear at the beginning of the segment or after another
      // hyphenated variant (e.g., "peer-not-ak-disabled"). We only care about
      // extracting the underlying ak-* token for dependency resolution.
      if (seg.startsWith("not-ak-")) {
        akTokens.push(seg.slice(4));
        continue;
      }
      const notIdx = seg.indexOf("not-ak-");
      if (notIdx >= 0) {
        const candidate = seg.slice(notIdx + 4);
        if (candidate.startsWith("ak-")) {
          akTokens.push(candidate);
        }
      }
    }
  }
  return uniqPreserveOrder(akTokens);
}

function findVarNamesInString(value: string) {
  const out: string[] = [];
  const re = /var\(\s*(--[A-Za-z0-9_-]+)\b[^)]*\)/g;
  let match: RegExpExecArray | null;
  while (true) {
    match = re.exec(value);
    if (!match) break;
    const name = match[1];
    if (name) {
      out.push(name);
    }
  }
  return uniqPreserveOrder(out);
}

function collectAllValuesFromPropertyDecls(decls?: PropertyDecl[]): string[] {
  if (!decls) {
    return [];
  }
  const out: string[] = [];
  for (const d of decls) {
    if (typeof d.value === "string") {
      out.push(d.value);
      continue;
    }
    if (Array.isArray(d.value)) {
      out.push(...collectAllValuesFromPropertyDecls(d.value));
      continue;
    }
    // Valueless declarations (value is an empty object)
    const name = d.name;
    if (!name) {
      continue;
    }
    // Skip comments and @slot declarations
    if (name.startsWith("/*") && name.endsWith("*/")) {
      continue;
    }
    if (name === "@slot") {
      continue;
    }
    // Extract tokens from @apply declarations stored on name
    if (name.startsWith("@apply")) {
      const raw = name.slice("@apply".length).trim();
      if (raw) {
        out.push(raw);
      }
      continue;
    }
    // For other valueless declarations, include the name for token scanning
    out.push(name);
  }
  return out;
}

function collectVariantNamesFromPropertyDecls(
  decls?: PropertyDecl[],
): string[] {
  if (!decls) {
    return [];
  }
  const out: string[] = [];
  const visit = (items: PropertyDecl[]) => {
    for (const item of items) {
      for (const variantName of extractVariantNamesFromDeclName(item.name)) {
        out.push(variantName);
      }
      if (Array.isArray(item.value)) {
        visit(item.value);
      }
    }
  };
  visit(decls);
  return uniqPreserveOrder(out);
}

function extractVariantNamesFromDeclName(name: string): string[] {
  if (!name.startsWith("@variant")) {
    return [];
  }
  const raw = name.slice("@variant".length).trim();
  if (!raw) {
    return [];
  }
  return extractAkTokensFromApplyLine(raw);
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
      const nestedValues = collectAllValuesFromPropertyDecls(util.properties);
      for (const v of nestedValues) {
        // Any nested apply lines are stored as entire lines in val.apply;
        // others are declarations We still scan all strings for ak-* tokens
        const akTokens = extractAkTokensFromApplyLine(v);
        for (const t of akTokens) {
          const utilMod = index.utilToModule.get(t);
          if (utilMod) {
            addDep(deps, { type: "utility", name: t, module: utilMod });
          } else {
            const variantMod = index.variantToModule.get(t);
            if (variantMod) {
              addDep(deps, { type: "variant", name: t, module: variantMod });
            } else if (t.startsWith("ak-")) {
              addDep(deps, {
                type: "utility",
                name: t,
                import: externalImport,
              });
            }
          }
        }
        // Also scan for var(--prop)
        for (const varName of findVarNamesInString(v)) {
          const propModule = index.atPropToModule.get(varName);
          if (propModule) {
            addDep(deps, {
              type: "at-property",
              name: varName,
              module: propModule,
            });
          }
        }
      }
      const variantNames = collectVariantNamesFromPropertyDecls(
        util.properties,
      );
      for (const variantName of variantNames) {
        const variantModule = index.variantToModule.get(variantName);
        if (variantModule) {
          addDep(deps, {
            type: "variant",
            name: variantName,
            module: variantModule,
          });
          continue;
        }
        if (variantName.startsWith("ak-")) {
          addDep(deps, {
            type: "variant",
            name: variantName,
            import: externalImport,
          });
        }
      }
      util.dependencies = deps;
    }
    // Variants typically have no deps; leave empty unless their rules reference
    // var() or ak-* tokens
    for (const variant of Object.values(mod.variants)) {
      const deps: Dependency[] = [];
      const values = collectAllValuesFromPropertyDecls(variant.properties);
      for (const v of values) {
        const akTokens = extractAkTokensFromApplyLine(v);
        for (const t of akTokens) {
          const utilMod = index.utilToModule.get(t);
          if (utilMod) {
            addDep(deps, { type: "utility", name: t, module: utilMod });
          } else {
            const variantMod = index.variantToModule.get(t);
            if (variantMod) {
              addDep(deps, { type: "variant", name: t, module: variantMod });
            } else if (t.startsWith("ak-")) {
              addDep(deps, {
                type: "utility",
                name: t,
                import: externalImport,
              });
            }
          }
        }
        for (const varName of findVarNamesInString(v)) {
          const propModule = index.atPropToModule.get(varName);
          if (propModule) {
            addDep(deps, {
              type: "at-property",
              name: varName,
              module: propModule,
            });
          }
        }
      }
      variant.dependencies = deps;
    }
  }
}

/**
 * Build global index section
 */
function buildIndexSection(modules: ModuleJson[]): StylesJson["index"] {
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

  const json: StylesJson = {
    version: 2,
    modules,
    index: buildIndexSection(modules),
  };

  await fs.writeFile(outputPath, `${JSON.stringify(json, null, 2)}\n`, "utf8");
  return outputPath;
}

async function main() {
  const args = process.argv.slice(2);
  const isCheck = args.includes("--check");
  const tempOut = path.join(STYLES_DIR, ".styles.check.json");
  const outPath = isCheck ? tempOut : OUTPUT_JSON;
  const out = await buildAkStylesIndex(outPath);
  if (isCheck) {
    let expected = "";
    try {
      expected = await fs.readFile(OUTPUT_JSON, "utf8");
    } catch {
      // missing expected file counts as mismatch
    }
    const actual = await fs.readFile(out, "utf8");
    if (expected !== actual) {
      console.error(
        "styles.json is out of date. Run: npm run build-styles -w site",
      );
      process.exitCode = 1;
    }
    // cleanup temp file
    try {
      await fs.unlink(tempOut);
    } catch {}
    return;
  }
  console.log(`Wrote ${toPosix(out)}`);
}

const isMain = import.meta.filename === path.resolve(process.argv[1] ?? "");
if (isMain) {
  // no void to preserve stack traces on unhandled rejections
  main();
}

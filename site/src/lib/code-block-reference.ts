/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

import type { CollectionEntry } from "astro:content";
import { getReferenceItemId } from "#app/lib/reference.ts";
import type { Framework } from "#app/lib/schemas.ts";
import { getReferencePath } from "#app/lib/url.ts";

export type ReferenceLabelKind = "component" | "function" | "store" | "prop";

export interface CodeReferenceAnchorRange {
  start: number;
  end: number;
  href: string;
  kind: ReferenceLabelKind;
}

export interface FindCodeReferenceAnchorsParams {
  code: string;
  references: CollectionEntry<"references">[];
  framework?: Framework;
}

interface NameToReference {
  [exportedName: string]: CollectionEntry<"references"> | undefined;
}

interface KindByName {
  [exportedName: string]: ReferenceLabelKind | undefined;
}

interface ImportInfo {
  hasAriakitImport: boolean;
  namespaceAliases: Set<string>;
  namedImports: Map<string, string>; // localName -> exportedName
}

function getFrameworkReferences(
  references: CollectionEntry<"references">[],
  framework?: Framework,
) {
  const list = framework
    ? references.filter((r) => r.data.framework === framework)
    : references;
  const nameToRef: NameToReference = Object.create(null);
  const kindByName: KindByName = Object.create(null);
  for (const ref of list) {
    nameToRef[ref.data.name] = ref;
    if (ref.data.kind === "component") kindByName[ref.data.name] = "component";
    else if (ref.data.kind === "store") kindByName[ref.data.name] = "store";
    else kindByName[ref.data.name] = "function";
  }
  return { list, nameToRef, kindByName } as const;
}

function parseAriakitImports(code: string): ImportInfo {
  const namespaceAliases = new Set<string>();
  const namedImports = new Map<string, string>();
  let hasAriakitImport = false;

  const importRe =
    /import\s+([\s\S]*?)\s+from\s*["'](@ariakit\/(?:react|solid))(?:-core)?["']/g;
  let m: RegExpExecArray | null;
  while ((m = importRe.exec(code))) {
    hasAriakitImport = true;
    const importClause = m[1] || "";

    // Namespace import: * as ak
    const nsRe = /\*\s+as\s+([A-Za-z_$][\w$]*)/g;
    let nsMatch: RegExpExecArray | null;
    while ((nsMatch = nsRe.exec(importClause))) {
      namespaceAliases.add(nsMatch[1]!);
    }

    // Named imports: { A, B as C }
    const namedBlockRe = /\{([\s\S]*?)\}/g;
    let nb: RegExpExecArray | null;
    while ((nb = namedBlockRe.exec(importClause))) {
      const inside = nb[1] || "";
      const specRe = /([A-Za-z_$][\w$]*)(?:\s+as\s+([A-Za-z_$][\w$]*))?/g;
      let s: RegExpExecArray | null;
      while ((s = specRe.exec(inside))) {
        const exported = s[1]!;
        const local = (s[2] || s[1])!;
        namedImports.set(local, exported);
      }
    }
  }

  return { hasAriakitImport, namespaceAliases, namedImports };
}

function pushRange(
  ranges: CodeReferenceAnchorRange[],
  start: number,
  end: number,
  href: string | undefined,
  kind: ReferenceLabelKind,
) {
  if (!href) return;
  if (start >= end) return;
  ranges.push({ start, end, href, kind });
}

function findClosingAngleBracket(code: string, fromIndex: number) {
  // Naive scan until next ">"; this is good enough for our usage
  const idx = code.indexOf(">", fromIndex);
  return idx === -1 ? null : idx;
}

function findComponentPropRanges(
  code: string,
  tagStartIndex: number,
  componentRef: CollectionEntry<"references">,
) {
  const result: Array<{ start: number; end: number; name: string }> = [];
  const end = findClosingAngleBracket(code, tagStartIndex);
  if (end == null) return result;
  const tagText = code.slice(tagStartIndex, end);

  const propsParam = componentRef.data.params.find((p) => p.name === "props");
  const allowed = new Set(
    (propsParam?.props || []).map((p) => p.name).filter(Boolean),
  );
  if (!allowed.size) return result;

  const re = /(^|\s)([A-Za-z_$][\w$-]*)(?=\s*(=|[\s/>]|$))/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(tagText))) {
    const prop = m[2]!;
    if (!allowed.has(prop)) continue;
    const abs = (m.index || 0) + tagStartIndex + (m[1] ? m[1].length : 0);
    result.push({ start: abs, end: abs + prop.length, name: prop });
  }
  return result;
}

function findObjectLiteralAtFirstArg(code: string, callStartIndex: number) {
  // Find the opening parenthesis after the function name
  const openParen = code.indexOf("(", callStartIndex);
  if (openParen === -1) return null;
  let i = openParen + 1;
  let depth = 0;
  let inString: false | '"' | "'" | "`" = false;
  while (i < code.length) {
    const ch = code[i]!;
    if (inString) {
      if (ch === inString) inString = false;
      else if (ch === "\\") i++;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      inString = ch;
      i++;
      continue;
    }
    if (ch === "(") depth++;
    if (ch === ")") {
      if (depth === 0) break;
      depth--;
    }
    if (ch === "{" && depth === 0) {
      // Found first-arg object literal start
      const start = i;
      // Find its end
      let j = i + 1;
      let braceDepth = 1;
      let inStr: false | '"' | "'" | "`" = false;
      while (j < code.length && braceDepth > 0) {
        const c = code[j]!;
        if (inStr) {
          if (c === inStr) inStr = false;
          else if (c === "\\") j++;
          j++;
          continue;
        }
        if (c === '"' || c === "'" || c === "`") {
          inStr = c;
          j++;
          continue;
        }
        if (c === "{") braceDepth++;
        else if (c === "}") braceDepth--;
        j++;
      }
      const end = j; // position after closing }
      return { start, end } as const;
    }
    i++;
  }
  return null;
}

function findTopLevelObjectKeys(
  code: string,
  objStart: number,
  objEnd: number,
) {
  const keys: Array<{ start: number; end: number; name: string }> = [];
  const text = code.slice(objStart, objEnd);
  let depth = 0;
  let i = 0;
  let inString: false | '"' | "'" | "`" = false;
  while (i < text.length) {
    const ch = text[i]!;
    if (inString) {
      if (ch === inString) inString = false;
      else if (ch === "\\") i++;
      i++;
      continue;
    }
    if (ch === '"' || ch === "'" || ch === "`") {
      inString = ch;
      i++;
      continue;
    }
    if (ch === "{") depth++;
    if (ch === "}") depth--;
    if (depth === 1) {
      // At top level inside the object
      const idMatch = /([A-Za-z_$][\w$]*)/y; // sticky regex
      idMatch.lastIndex = i;
      const m = idMatch.exec(text);
      if (m) {
        const name = m[1]!;
        const start = objStart + m.index!;
        const end = start + name.length;
        keys.push({ start, end, name });
        i = m.index! + name.length;
        continue;
      }
    }
    i++;
  }
  return keys;
}

function findUseStoreStateStateRanges(code: string, callStartIndex: number) {
  const ranges: Array<{ start: number; end: number; name: string }> = [];
  const callText = code.slice(callStartIndex);
  // String literal variant
  const strRe = /useStoreState\s*\(\s*[^,]*,\s*(["'`])([A-Za-z_$][\w$]*)\1/;
  const strMatch = strRe.exec(callText);
  if (strMatch) {
    const idx = (strMatch.index || 0) + callStartIndex;
    const quote = strMatch[1]!;
    const name = strMatch[2]!;
    // Start inside the quotes
    const absoluteStart =
      idx + strMatch[0]!.lastIndexOf(quote + name + quote) + 1;
    ranges.push({
      start: absoluteStart,
      end: absoluteStart + name.length,
      name,
    });
  }
  // Arrow selector variant: (s) => s.value
  const arrowRe =
    /useStoreState\s*\(\s*[^,]*,\s*\(?([A-Za-z_$][\w$]*)\)?\s*=>\s*\1\s*\.\s*([A-Za-z_$][\w$]*)/;
  const arrowMatch = arrowRe.exec(callText);
  if (arrowMatch) {
    const idx = (arrowMatch.index || 0) + callStartIndex;
    const name = arrowMatch[2]!;
    const absoluteStart = idx + arrowMatch[0]!.lastIndexOf(name);
    ranges.push({
      start: absoluteStart,
      end: absoluteStart + name.length,
      name,
    });
  }
  return ranges;
}

function findClassTokenRanges(code: string) {
  const ranges: Array<{ start: number; end: number; name: string }> = [];
  // Match class or className attributes with string or template literal content
  const attrRe = /(className|class)\s*=\s*(\{\s*["'`]|["'`])/g;
  let m: RegExpExecArray | null;
  while ((m = attrRe.exec(code))) {
    const after = m[2]!;
    const isWrapped = after.startsWith("{");
    const quote = after[isWrapped ? 1 : 0] as '"' | "'" | "`";
    const contentStart = attrRe.lastIndex;
    // Find closing quote strictly to bound scanning to the attribute value
    let k = contentStart;
    while (k < code.length) {
      const ch = code[k]!;
      if (ch === "\\") {
        k += 2;
        continue;
      }
      if (ch === quote) break;
      k++;
    }
    const contentEnd = k;
    if (contentEnd <= contentStart) continue;

    let i = contentStart;
    while (i < contentEnd) {
      // Skip whitespace
      const ws = /\s+/y;
      ws.lastIndex = i;
      const wsMatch = ws.exec(code);
      if (wsMatch) {
        i = ws.lastIndex;
        if (i >= contentEnd) break;
      }
      const segRe = /\S+/y;
      segRe.lastIndex = i;
      const seg = segRe.exec(code);
      if (!seg) break;
      const segText = seg[0]!;
      const segStart = seg.index!;
      const segAbsEnd = Math.min(segStart + segText.length, contentEnd);

      // Split by colons, but ignore colons inside [] or ()
      let partStart = segStart;
      let depthBrackets = 0;
      let depthParens = 0;
      for (let j = 0; j <= segText.length && segStart + j <= contentEnd; j++) {
        const isEnd = j === segText.length || segStart + j === contentEnd;
        const c = isEnd ? "" : segText[j]!;
        if (!isEnd) {
          if (c === "[") depthBrackets++;
          else if (c === "]") depthBrackets = Math.max(0, depthBrackets - 1);
          else if (c === "(") depthParens++;
          else if (c === ")") depthParens = Math.max(0, depthParens - 1);
        }
        const isColonBoundary =
          !isEnd && c === ":" && depthBrackets === 0 && depthParens === 0;
        if (isColonBoundary || isEnd) {
          const partEnd = Math.min(segStart + j, contentEnd);
          const partText = code.slice(partStart, partEnd);
          if (partText.startsWith("ak-")) {
            ranges.push({ start: partStart, end: partEnd, name: partText });
          }
          partStart = segStart + j + 1; // skip colon
        }
      }
      i = segAbsEnd + 1;
    }
  }
  return ranges;
}

export function findCodeReferenceAnchors({
  code,
  references,
  framework,
}: FindCodeReferenceAnchorsParams): CodeReferenceAnchorRange[][] {
  const trimmed = code.trim();
  const anchors: CodeReferenceAnchorRange[] = [];

  const { nameToRef } = getFrameworkReferences(references, framework);
  const { hasAriakitImport, namedImports, namespaceAliases } =
    parseAriakitImports(trimmed);

  const hasAnyAriakit = hasAriakitImport;

  // Helper: derive store ref from a callable name (e.g., useXxxContext -> useXxxStore)
  function getStoreRefFromCallableName(name: string) {
    if (nameToRef[name]?.data.kind === "store") return nameToRef[name]!;
    const contextMatch = /^use(.+)Context$/.exec(name);
    if (contextMatch) {
      const base = contextMatch[1]!;
      const storeName = `use${base}Store`;
      const storeRef = nameToRef[storeName];
      if (storeRef && storeRef.data.kind === "store") return storeRef;
    }
    return undefined;
  }

  // 1) Named imports: anchor local identifiers
  const namedImportRe =
    /import\s+([\s\S]*?)\s+from\s*["'](@ariakit\/(?:react|solid))(?:-core)?["']/g;
  let imp: RegExpExecArray | null;
  while ((imp = namedImportRe.exec(trimmed))) {
    const clause = imp[1] || "";
    const blockRe = /\{([\s\S]*?)\}/g;
    let block: RegExpExecArray | null;
    while ((block = blockRe.exec(clause))) {
      const inside = block[1] || "";
      const base = (imp.index || 0) + clause.indexOf("{" + inside + "}") + 1;
      const specRe = /([A-Za-z_$][\w$]*)(?:\s+as\s+([A-Za-z_$][\w$]*))?/g;
      let s: RegExpExecArray | null;
      while ((s = specRe.exec(inside))) {
        const exported = s[1]!;
        const local = (s[2] || s[1])!;
        const ref = nameToRef[exported];
        if (!ref) continue;
        // Absolute start of the local name within code
        const specText = s[0]!;
        const localPosInSpec = specText.lastIndexOf(local);
        const start = base + (s.index || 0) + localPosInSpec;
        const end = start + local.length;
        const href = getReferencePath({ reference: ref });
        const labelKind = (
          ref.data.kind === "component"
            ? "component"
            : ref.data.kind === "store"
              ? "store"
              : "function"
        ) as ReferenceLabelKind;
        pushRange(anchors, start, end, href, labelKind);
      }
    }
  }

  // Helper to anchor component by name with start/end
  function anchorComponentToken(start: number, end: number, name: string) {
    const ref = nameToRef[name];
    if (!ref) return;
    pushRange(
      anchors,
      start,
      end,
      getReferencePath({ reference: ref }),
      "component",
    );
  }

  // 2) Component opening tags
  const nsCompRe = /<([A-Za-z_$][\w$]*)\.([A-Z][\w$]*)(?=[\s/>])/g;
  let mc: RegExpExecArray | null;
  while ((mc = nsCompRe.exec(trimmed))) {
    const full = mc[0]!;
    const ns = mc[1]!;
    const name = mc[2]!;
    const dotPos = full.lastIndexOf(".");
    const tokenStart = (mc.index || 0) + dotPos + 1;
    const tokenEnd = tokenStart + name.length;
    if (namespaceAliases.has(ns) || !hasAnyAriakit) {
      anchorComponentToken(tokenStart, tokenEnd, name);
    }
    // Props inside this tag
    const ref = nameToRef[name];
    if (ref) {
      const propRanges = findComponentPropRanges(trimmed, mc.index || 0, ref);
      for (const r of propRanges) {
        const href = getReferencePath({
          reference: ref,
          item: getReferenceItemId("prop", r.name),
        });
        pushRange(anchors, r.start, r.end, href, "prop");
      }
    }
  }

  const compRe = /<([A-Z][\w$]*)(?=[\s/>])/g;
  let mcn: RegExpExecArray | null;
  while ((mcn = compRe.exec(trimmed))) {
    const name = mcn[1]!;
    if (namedImports.has(name) || !hasAnyAriakit) {
      const start = (mcn.index || 0) + 1; // after '<'
      const end = start + name.length;
      anchorComponentToken(start, end, name);
      const ref = nameToRef[name];
      if (ref) {
        const propRanges = findComponentPropRanges(
          trimmed,
          mcn.index || 0,
          ref,
        );
        for (const r of propRanges) {
          const href = getReferencePath({
            reference: ref,
            item: getReferenceItemId("prop", r.name),
          });
          pushRange(anchors, r.start, r.end, href, "prop");
        }
      }
    }
  }

  // 3) Store and function calls, plus their option props
  // Namespaced calls: ak.useDisclosureStore(...)
  const nsCallRe = /\b([A-Za-z_$][\w$]*)\.([A-Za-z_$][\w$]*)\s*\(/g;
  let call: RegExpExecArray | null;
  const storeVarToRef = new Map<string, CollectionEntry<"references">>();
  while ((call = nsCallRe.exec(trimmed))) {
    const ns = call[1]!;
    const fn = call[2]!;
    if (!namespaceAliases.has(ns) && hasAnyAriakit) continue;
    const ref = nameToRef[fn];
    const storeRef = getStoreRefFromCallableName(fn);
    if (!ref && !storeRef) continue;
    const labelKind = (
      (ref?.data.kind || storeRef?.data.kind) === "store"
        ? "store"
        : (ref?.data.kind || storeRef?.data.kind) === "component"
          ? "component"
          : "function"
    ) as ReferenceLabelKind;
    const start = (call.index || 0) + ns.length + 1; // after ns.
    const end = start + fn.length;
    pushRange(
      anchors,
      start,
      end,
      getReferencePath({ reference: ref || storeRef! }),
      labelKind,
    );

    // If assigned to a variable, remember it
    const leftSpan = trimmed.slice(
      Math.max(0, (call.index || 0) - 60),
      call.index,
    );
    const assignMatch = /(const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*$/m.exec(
      leftSpan,
    );
    if (assignMatch) {
      const varName = assignMatch[2]!;
      const refForVar =
        storeRef || (ref?.data.kind === "store" ? ref : undefined);
      if (refForVar) storeVarToRef.set(varName, refForVar);
    }

    // First-arg object literal props
    const obj = findObjectLiteralAtFirstArg(trimmed, call.index || 0);
    const refForProps = ref || storeRef;
    if (obj && refForProps?.data.params?.[0]?.props?.length) {
      const allowed = new Set(
        refForProps.data.params[0]!.props!.map((p) => p.name),
      );
      const keys = findTopLevelObjectKeys(trimmed, obj.start, obj.end);
      for (const k of keys) {
        if (!allowed.has(k.name)) continue;
        const href = getReferencePath({
          reference: refForProps,
          item: getReferenceItemId("prop", k.name),
        });
        pushRange(anchors, k.start, k.end, href, "prop");
      }
    }
  }

  // Non-namespaced calls (named imports): useDisclosureStore(...)
  const plainCallRe = /\b([A-Za-z_$][\w$]*)\s*\(/g;
  let pc: RegExpExecArray | null;
  while ((pc = plainCallRe.exec(trimmed))) {
    const local = pc[1]!;
    const exported =
      namedImports.get(local) || (!hasAnyAriakit ? local : undefined);
    if (!exported) continue;
    const ref = nameToRef[exported];
    const storeRef = getStoreRefFromCallableName(exported);
    if (!ref && !storeRef) continue;
    const labelKind = (
      (ref?.data.kind || storeRef?.data.kind) === "store"
        ? "store"
        : (ref?.data.kind || storeRef?.data.kind) === "component"
          ? "component"
          : "function"
    ) as ReferenceLabelKind;
    const start = pc.index || 0;
    const end = start + local.length;
    pushRange(
      anchors,
      start,
      end,
      getReferencePath({ reference: ref || storeRef! }),
      labelKind,
    );

    // If assigned to a variable, remember it
    const leftSpan = trimmed.slice(Math.max(0, (pc.index || 0) - 60), pc.index);
    const assignMatch = /(const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*$/m.exec(
      leftSpan,
    );
    if (assignMatch) {
      const varName = assignMatch[2]!;
      const refForVar =
        storeRef || (ref?.data.kind === "store" ? ref : undefined);
      if (refForVar) storeVarToRef.set(varName, refForVar);
    }

    // First-arg object literal props
    const obj = findObjectLiteralAtFirstArg(trimmed, pc.index || 0);
    const refForProps = ref || storeRef;
    if (obj && refForProps?.data.params?.[0]?.props?.length) {
      const allowed = new Set(
        refForProps.data.params[0]!.props!.map((p) => p.name),
      );
      const keys = findTopLevelObjectKeys(trimmed, obj.start, obj.end);
      for (const k of keys) {
        if (!allowed.has(k.name)) continue;
        const href = getReferencePath({
          reference: refForProps,
          item: getReferenceItemId("prop", k.name),
        });
        pushRange(anchors, k.start, k.end, href, "prop");
      }
    }
  }

  // 4) useStoreState states (only if we imported it or namespaced alias exists)
  // Determine whether useStoreState is available
  const hasUseStoreState =
    namedImports.has("useStoreState") ||
    namespaceAliases.size > 0 ||
    !hasAnyAriakit;
  if (hasUseStoreState) {
    const useStoreRe =
      /\buseStoreState\b|\b([A-Za-z_$][\w$]*)\.useStoreState\b/g;
    let ms: RegExpExecArray | null;
    while ((ms = useStoreRe.exec(trimmed))) {
      const callIndex = ms.index || 0;
      const stateRanges = findUseStoreStateStateRanges(trimmed, callIndex);
      for (const r of stateRanges) {
        // Try to resolve reference by looking at the first argument variable name
        // Grab a small window to the left to find variable name inside the call
        const argSlice = trimmed.slice(callIndex, callIndex + 120);
        const firstArgVarMatch = /useStoreState\s*\(\s*([A-Za-z_$][\w$]*)/.exec(
          argSlice,
        );
        const varName = firstArgVarMatch?.[1];
        const ref = (varName && storeVarToRef.get(varName)) || undefined;
        if (ref) {
          const href = getReferencePath({
            reference: ref,
            item: getReferenceItemId("state", r.name),
          });
          pushRange(anchors, r.start, r.end, href, "prop");
        }
      }
    }
  }

  // 5) return-prop: accesses on known store variables
  if (storeVarToRef.size) {
    for (const [varName, ref] of storeVarToRef) {
      const re = new RegExp(
        String.raw`\b${varName.replace(/[$]/g, "\$")}\s*\.\s*([A-Za-z_$][\w$]*)`,
        "g",
      );
      let rm: RegExpExecArray | null;
      const allowed = new Set(
        ref.data.returnValue?.props?.map((p) => p.name) || [],
      );
      while ((rm = re.exec(trimmed))) {
        const name = rm[1]!;
        if (!allowed.has(name)) continue;
        const start =
          (rm.index || 0) +
          varName.length +
          trimmed.slice(rm.index || 0).indexOf(".") +
          1;
        const end = start + name.length;
        const href = getReferencePath({
          reference: ref,
          item: getReferenceItemId("return-prop", name),
        });
        pushRange(anchors, start, end, href, "prop");
      }
    }
  }

  // 6) ak- class tokens
  const classRanges = findClassTokenRanges(trimmed);
  for (const r of classRanges) {
    // Placeholder: link to current page anchor so hovercard fetch will no-op
    const href = "#";
    pushRange(anchors, r.start, r.end, href, "prop");
  }

  // Build per-line anchors
  const lines = trimmed.split("\n");
  const byLine: CodeReferenceAnchorRange[][] = lines.map(() => []);
  let charIndex = 0;
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    const lineStart = charIndex;
    const lineEnd = lineStart + lines[lineIndex]!.length;
    for (const a of anchors) {
      if (a.start < lineEnd && a.end > lineStart) {
        const start = Math.max(0, a.start - lineStart);
        const end = Math.min(lines[lineIndex]!.length, a.end - lineStart);
        byLine[lineIndex]!.push({ ...a, start, end });
      }
    }
    charIndex = lineEnd + 1;
  }
  // Sort by start index per line and merge if overlapping and identical target
  for (const list of byLine) {
    list.sort((a, b) => a.start - b.start);
    for (let i = 1; i < list.length; i++) {
      const prev = list[i - 1]!;
      const cur = list[i]!;
      if (
        cur.start <= prev.end &&
        cur.href === prev.href &&
        cur.kind === prev.kind
      ) {
        prev.end = Math.max(prev.end, cur.end);
        list.splice(i, 1);
        i--;
      }
    }
  }

  return byLine;
}

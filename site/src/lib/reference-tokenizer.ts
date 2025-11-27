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

// #region Types

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

interface TokenRange {
  start: number;
  end: number;
  name: string;
}

// #endregion

// #region Common Patterns

/** Matches a valid JavaScript identifier */
const IDENTIFIER_PATTERN = "[A-Za-z_$][\\w$]*";

/** Matches an identifier starting with uppercase (component-like) */
const COMPONENT_NAME_PATTERN = "[A-Z][\\w$]*";

/** Characters that can precede a JSX tag (not identifier characters) */
const NON_IDENTIFIER_CHAR_PATTERN = /[_$A-Za-z0-9]/;

/** Quote characters for string literals */
type QuoteChar = '"' | "'" | "`";

// #endregion

// #region String Utilities

function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/**
 * Checks if a character is a quote character.
 */
function isQuoteChar(char: string): char is QuoteChar {
  return char === '"' || char === "'" || char === "`";
}

/**
 * Scans forward in code, skipping over a string literal (starting at the
 * opening quote position). Returns the index after the closing quote.
 */
function skipStringLiteral(code: string, startIndex: number): number {
  const quote = code[startIndex];
  if (!quote || !isQuoteChar(quote)) return startIndex + 1;

  let index = startIndex + 1;
  while (index < code.length) {
    const char = code[index]!;
    if (char === "\\") {
      index += 2;
      continue;
    }
    if (char === quote) return index + 1;
    index++;
  }
  return index;
}

/**
 * Finds the index of a closing bracket/brace/paren, respecting nesting and
 * string literals.
 */
function findMatchingClose(
  code: string,
  openIndex: number,
  openChar: string,
  closeChar: string,
): number | null {
  let depth = 1;
  let index = openIndex + 1;

  while (index < code.length && depth > 0) {
    const char = code[index]!;
    if (isQuoteChar(char)) {
      index = skipStringLiteral(code, index);
      continue;
    }
    if (char === openChar) {
      depth++;
    } else if (char === closeChar) {
      depth--;
    }
    index++;
  }

  return depth === 0 ? index - 1 : null;
}

// #endregion

// #region Import Parsing

/**
 * Parses Ariakit imports to extract namespace aliases and named imports.
 */
function parseAriakitImports(code: string): ImportInfo {
  const namespaceAliases = new Set<string>();
  const namedImports = new Map<string, string>();
  let hasAriakitImport = false;

  const importRegex =
    /import\s+([\s\S]*?)\s+from\s*["'](@ariakit\/[\w-]+)(?:-core)?["']/g;
  let match: RegExpExecArray | null;

  while ((match = importRegex.exec(code))) {
    hasAriakitImport = true;
    const importClause = match[1] || "";

    extractNamespaceAliases(importClause, namespaceAliases);
    extractNamedImports(importClause, namedImports);
  }

  return { hasAriakitImport, namespaceAliases, namedImports };
}

/**
 * Extracts namespace aliases (e.g., `* as ak`) from an import clause.
 */
function extractNamespaceAliases(clause: string, aliases: Set<string>) {
  const nsRegex = new RegExp(`\\*\\s+as\\s+(${IDENTIFIER_PATTERN})`, "g");
  let match: RegExpExecArray | null;
  while ((match = nsRegex.exec(clause))) {
    const alias = match[1];
    if (alias) {
      aliases.add(alias);
    }
  }
}

/**
 * Extracts named imports (e.g., `{ A, B as C }`) from an import clause.
 */
function extractNamedImports(clause: string, imports: Map<string, string>) {
  const namedBlockRegex = /\{([\s\S]*?)\}/g;
  let blockMatch: RegExpExecArray | null;

  while ((blockMatch = namedBlockRegex.exec(clause))) {
    const inside = blockMatch[1] || "";
    const specRegex = new RegExp(
      `(${IDENTIFIER_PATTERN})(?:\\s+as\\s+(${IDENTIFIER_PATTERN}))?`,
      "g",
    );
    let specMatch: RegExpExecArray | null;

    while ((specMatch = specRegex.exec(inside))) {
      const exported = specMatch[1]!;
      const local = specMatch[2] || exported;
      imports.set(local, exported);
    }
  }
}

/**
 * Parses all imports to build a map of local names to their source modules.
 */
function parseLocalImports(code: string): Map<string, string> {
  const localToSource = new Map<string, string>();
  const importRegex =
    /import\s+(type\s+)?([\s\S]*?)\s+from\s*["']([^"']+)["']/g;
  let match: RegExpExecArray | null;

  while ((match = importRegex.exec(code))) {
    const isTypeImport = Boolean(match[1]);
    if (isTypeImport) continue;

    const clause = match[2] || "";
    const source = match[3] || "";

    // Namespace imports: * as X
    const nsRegex = new RegExp(`\\*\\s+as\\s+(${IDENTIFIER_PATTERN})`, "g");
    let nsMatch: RegExpExecArray | null;
    while ((nsMatch = nsRegex.exec(clause))) {
      const alias = nsMatch[1];
      if (alias) {
        localToSource.set(alias, source);
      }
    }

    // Default imports: Name, ...
    const defaultRegex = new RegExp(`^\\s*(${IDENTIFIER_PATTERN})\\s*(?:,|$)`);
    const defaultMatch = defaultRegex.exec(clause);
    if (defaultMatch?.[1]) {
      localToSource.set(defaultMatch[1], source);
    }

    // Named imports: { A, B as C }
    const namedBlockRegex = /\{([\s\S]*?)\}/g;
    let blockMatch: RegExpExecArray | null;
    while ((blockMatch = namedBlockRegex.exec(clause))) {
      const inside = blockMatch[1] || "";
      const specRegex = new RegExp(
        `(${IDENTIFIER_PATTERN})(?:\\s+as\\s+(${IDENTIFIER_PATTERN}))?`,
        "g",
      );
      let specMatch: RegExpExecArray | null;
      while ((specMatch = specRegex.exec(inside))) {
        const local = specMatch[2] || specMatch[1]!;
        localToSource.set(local, source);
      }
    }
  }

  return localToSource;
}

// #endregion

// #region Reference Helpers

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
    if (ref.data.kind === "component") {
      kindByName[ref.data.name] = "component";
    } else if (ref.data.kind === "store") {
      kindByName[ref.data.name] = "store";
    } else {
      kindByName[ref.data.name] = "function";
    }
  }

  return { list, nameToRef, kindByName } as const;
}

/**
 * Gets the label kind for a reference.
 */
function getLabelKind(
  ref: CollectionEntry<"references"> | undefined,
): ReferenceLabelKind {
  if (!ref) return "function";
  if (ref.data.kind === "component") return "component";
  if (ref.data.kind === "store") return "store";
  return "function";
}

// #endregion

// #region Range Helpers

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

// #endregion

// #region JSX Parsing

/**
 * Finds the closing `>` of a JSX tag starting at the given index.
 */
function findClosingAngleBracket(
  code: string,
  fromIndex: number,
): number | null {
  const index = code.indexOf(">", fromIndex);
  return index === -1 ? null : index;
}

/**
 * Finds prop ranges within a JSX component tag.
 */
function findComponentPropRanges(
  code: string,
  tagStartIndex: number,
  componentRef: CollectionEntry<"references">,
): TokenRange[] {
  const result: TokenRange[] = [];
  const endIndex = findClosingAngleBracket(code, tagStartIndex);
  if (endIndex == null) return result;

  const tagText = code.slice(tagStartIndex, endIndex);
  const propsParam = componentRef.data.params.find((p) => p.name === "props");
  const allowedProps = new Set(
    (propsParam?.props || []).map((p) => p.name).filter(Boolean),
  );

  if (!allowedProps.size) return result;

  // Match prop names that are followed by = or whitespace/closing tag
  const propRegex = new RegExp(
    `(^|\\s)(${IDENTIFIER_PATTERN}(?:-${IDENTIFIER_PATTERN})*)(?=\\s*(=|[\\s/>]|$))`,
    "g",
  );
  let match: RegExpExecArray | null;

  while ((match = propRegex.exec(tagText))) {
    const propName = match[2]!;
    if (!allowedProps.has(propName)) continue;

    const leadingWhitespace = match[1] ? match[1].length : 0;
    const absoluteStart =
      (match.index || 0) + tagStartIndex + leadingWhitespace;
    result.push({
      start: absoluteStart,
      end: absoluteStart + propName.length,
      name: propName,
    });
  }

  return result;
}

// #endregion

// #region Function Call Parsing

/**
 * Finds the object literal passed as the first argument to a function call.
 */
function findObjectLiteralAtFirstArg(
  code: string,
  callStartIndex: number,
): { start: number; end: number } | null {
  const openParen = code.indexOf("(", callStartIndex);
  if (openParen === -1) return null;

  let index = openParen + 1;
  let depth = 0;
  let inString: false | QuoteChar = false;

  while (index < code.length) {
    const char = code[index]!;

    if (inString) {
      if (char === inString) {
        inString = false;
      } else if (char === "\\") {
        index++;
      }
      index++;
      continue;
    }

    if (isQuoteChar(char)) {
      inString = char;
      index++;
      continue;
    }

    if (char === "(") depth++;
    if (char === ")") {
      if (depth === 0) break;
      depth--;
    }

    if (char === "{" && depth === 0) {
      // Found first-arg object literal start
      const objStart = index;
      const closeIndex = findMatchingClose(code, index, "{", "}");
      if (closeIndex == null) return null;
      return { start: objStart, end: closeIndex + 1 };
    }

    index++;
  }

  return null;
}

/**
 * Finds top-level keys within an object literal.
 */
function findTopLevelObjectKeys(
  code: string,
  objStart: number,
  objEnd: number,
): TokenRange[] {
  const keys: TokenRange[] = [];
  const text = code.slice(objStart, objEnd);
  let depth = 0;
  let index = 0;
  let inString: false | QuoteChar = false;

  while (index < text.length) {
    const char = text[index]!;

    if (inString) {
      if (char === inString) {
        inString = false;
      } else if (char === "\\") {
        index++;
      }
      index++;
      continue;
    }

    if (isQuoteChar(char)) {
      inString = char;
      index++;
      continue;
    }

    if (char === "{") depth++;
    if (char === "}") depth--;

    // At top level inside the object, look for identifier keys
    if (depth === 1) {
      const idRegex = new RegExp(`(${IDENTIFIER_PATTERN})`, "y");
      idRegex.lastIndex = index;
      const match = idRegex.exec(text);
      if (match) {
        const name = match[1]!;
        const start = objStart + match.index!;
        const end = start + name.length;
        keys.push({ start, end, name });
        index = match.index! + name.length;
        continue;
      }
    }

    index++;
  }

  return keys;
}

/**
 * Finds state key ranges in useStoreState calls (both string and arrow
 * selector variants).
 */
function findUseStoreStateStateRanges(
  code: string,
  callStartIndex: number,
): TokenRange[] {
  const ranges: TokenRange[] = [];
  const callText = code.slice(callStartIndex);

  // String literal variant: useStoreState(store, "value")
  const stringRegex = new RegExp(
    `useStoreState\\s*\\(\\s*[^,]*,\\s*(["'\`])(${IDENTIFIER_PATTERN})\\1`,
  );
  const stringMatch = stringRegex.exec(callText);
  if (stringMatch) {
    const matchIndex = (stringMatch.index || 0) + callStartIndex;
    const quote = stringMatch[1]!;
    const name = stringMatch[2]!;
    const quotePosition = stringMatch[0]!.lastIndexOf(quote + name + quote);
    const absoluteStart = matchIndex + quotePosition + 1;
    ranges.push({
      start: absoluteStart,
      end: absoluteStart + name.length,
      name,
    });
  }

  // Arrow selector variant: useStoreState(store, (s) => s.value)
  const arrowRegex = new RegExp(
    `useStoreState\\s*\\(\\s*[^,]*,\\s*\\(?(${IDENTIFIER_PATTERN})\\)?\\s*=>\\s*\\1\\s*\\.\\s*(${IDENTIFIER_PATTERN})`,
  );
  const arrowMatch = arrowRegex.exec(callText);
  if (arrowMatch) {
    const matchIndex = (arrowMatch.index || 0) + callStartIndex;
    const name = arrowMatch[2]!;
    const absoluteStart = matchIndex + arrowMatch[0]!.lastIndexOf(name);
    ranges.push({
      start: absoluteStart,
      end: absoluteStart + name.length,
      name,
    });
  }

  return ranges;
}

// #endregion

// #region Class Token Parsing

/**
 * Finds ak- class tokens within className/class attributes.
 */
function findClassTokenRanges(code: string): TokenRange[] {
  const ranges: TokenRange[] = [];
  if (!code.includes("ak-")) return ranges;

  /**
   * Scans a range of code for ak- tokens, handling Tailwind-style modifiers
   * (e.g., `hover:ak-button`).
   */
  const findAkTokensInRange = (start: number, end: number) => {
    let index = start;

    while (index < end) {
      // Skip whitespace
      const wsRegex = /\s+/y;
      wsRegex.lastIndex = index;
      const wsMatch = wsRegex.exec(code);
      if (wsMatch) {
        index = wsRegex.lastIndex;
        if (index >= end) break;
      }

      // Find next segment (non-whitespace)
      const segmentRegex = /\S+/y;
      segmentRegex.lastIndex = index;
      const segment = segmentRegex.exec(code);
      if (!segment) break;

      const segmentText = segment[0]!;
      const segmentStart = segment.index!;
      const segmentAbsEnd = Math.min(segmentStart + segmentText.length, end);

      // Split by colons (Tailwind modifiers), ignoring colons inside [] or ()
      let partStart = segmentStart;
      let bracketDepth = 0;
      let parenDepth = 0;

      for (
        let charIndex = 0;
        charIndex <= segmentText.length && segmentStart + charIndex <= end;
        charIndex++
      ) {
        const isEnd =
          charIndex === segmentText.length || segmentStart + charIndex === end;
        const char = isEnd ? "" : segmentText[charIndex]!;

        if (!isEnd) {
          if (char === "[") bracketDepth++;
          else if (char === "]") bracketDepth = Math.max(0, bracketDepth - 1);
          else if (char === "(") parenDepth++;
          else if (char === ")") parenDepth = Math.max(0, parenDepth - 1);
        }

        const isColonBoundary =
          !isEnd && char === ":" && bracketDepth === 0 && parenDepth === 0;

        if (isColonBoundary || isEnd) {
          const partEnd = Math.min(segmentStart + charIndex, end);
          const partText = code.slice(partStart, partEnd);
          if (partText.startsWith("ak-")) {
            ranges.push({ start: partStart, end: partEnd, name: partText });
          }
          partStart = segmentStart + charIndex + 1; // skip colon
        }
      }

      index = segmentAbsEnd + 1;
    }
  };

  /**
   * Scans a template string for ak- tokens in static segments.
   */
  const scanTemplateStringSegments = (start: number, endBound: number) => {
    let index = start;
    let segmentStart = index;
    let templateDepth = 0;

    while (index < endBound) {
      const char = code[index]!;

      if (char === "\\") {
        index += 2;
        continue;
      }

      // Handle template expression ${...}
      if (char === "$" && code[index + 1] === "{") {
        if (index > segmentStart) {
          findAkTokensInRange(segmentStart, index);
        }
        index += 2;
        templateDepth = 1;
        while (index < endBound && templateDepth > 0) {
          const exprChar = code[index]!;
          if (exprChar === "\\") {
            index += 2;
            continue;
          }
          if (exprChar === "{") templateDepth++;
          else if (exprChar === "}") templateDepth--;
          index++;
        }
        segmentStart = index;
        continue;
      }

      if (char === "`") break;
      index++;
    }

    if (index > segmentStart) {
      findAkTokensInRange(segmentStart, index);
    }

    return index + 1; // position after closing backtick
  };

  /**
   * Scans a simple string (single or double quoted) for ak- tokens.
   */
  const scanSimpleString = (
    start: number,
    quote: '"' | "'",
    endBound: number,
  ): number => {
    let index = start;
    while (index < endBound) {
      const char = code[index]!;
      if (char === "\\") {
        index += 2;
        continue;
      }
      if (char === quote) break;
      index++;
    }
    const contentStart = start;
    const contentEnd = Math.min(index, endBound);
    if (contentEnd > contentStart) {
      findAkTokensInRange(contentStart, contentEnd);
    }
    return index + 1;
  };

  /**
   * Scans a JS expression for string literals containing ak- tokens.
   */
  const scanExpressionForStrings = (start: number): number => {
    let index = start;
    let curlyDepth = 0;
    let parenDepth = 0;
    let bracketDepth = 0;
    let inString: false | QuoteChar = false;

    while (index < code.length) {
      const char = code[index]!;

      if (inString) {
        if (inString === '"' || inString === "'") {
          index = scanSimpleString(index, inString, code.length);
          inString = false;
          continue;
        }
        // Template string
        if (inString === "`") {
          index = scanTemplateStringSegments(index, code.length);
          inString = false;
          continue;
        }
      }

      if (isQuoteChar(char)) {
        inString = char;
        index++;
        continue;
      }

      if (char === "(") {
        parenDepth++;
        index++;
        continue;
      }
      if (char === ")") {
        if (parenDepth > 0) parenDepth--;
        index++;
        continue;
      }
      if (char === "[") {
        bracketDepth++;
        index++;
        continue;
      }
      if (char === "]") {
        if (bracketDepth > 0) bracketDepth--;
        index++;
        continue;
      }
      if (char === "{") {
        curlyDepth++;
        index++;
        continue;
      }
      if (char === "}") {
        if (curlyDepth === 0 && parenDepth === 0 && bracketDepth === 0) {
          return index;
        }
        if (curlyDepth > 0) curlyDepth--;
        index++;
        continue;
      }

      // Comma at depth 0 ends expression
      if (
        char === "," &&
        curlyDepth === 0 &&
        parenDepth === 0 &&
        bracketDepth === 0
      ) {
        return index;
      }

      index++;
    }

    return index;
  };

  // Process className="..." or className={"..."} attributes
  const quotedAttrRegex = /(className|class)\s*=\s*(\{\s*["'`]|["'`])/g;
  let quotedMatch: RegExpExecArray | null;

  while ((quotedMatch = quotedAttrRegex.exec(code))) {
    const afterEquals = quotedMatch[2]!;
    const isWrapped = afterEquals.startsWith("{");
    const quote = afterEquals[isWrapped ? 1 : 0] as QuoteChar;
    const contentStart = quotedAttrRegex.lastIndex;

    // Find closing quote
    let index = contentStart;
    while (index < code.length) {
      const char = code[index]!;
      if (char === "\\") {
        index += 2;
        continue;
      }
      if (char === quote) break;
      index++;
    }

    const contentEnd = index;
    if (contentEnd > contentStart) {
      findAkTokensInRange(contentStart, contentEnd);
    }
  }

  // Process className={ expression } attributes
  const exprAttrRegex = /(className|class)\s*=\s*\{/g;

  while (exprAttrRegex.exec(code)) {
    const afterBrace = exprAttrRegex.lastIndex;

    // Check if next non-space is a quote (already handled above)
    const nextNonSpace = /\S/y;
    nextNonSpace.lastIndex = afterBrace;
    const nextChar = nextNonSpace.exec(code);
    if (!nextChar) break;
    if (isQuoteChar(nextChar[0]!)) continue;

    // Find matching closing brace while respecting strings
    let depth = 1;
    let index = afterBrace;
    let inString: false | QuoteChar = false;
    let templateExprDepth = 0;

    while (index < code.length && depth > 0) {
      const char = code[index]!;

      if (inString) {
        if (char === "\\") {
          index += 2;
          continue;
        }
        if (inString === "`" && char === "$" && code[index + 1] === "{") {
          templateExprDepth++;
          index += 2;
          continue;
        }
        if (inString === "`" && char === "}" && templateExprDepth > 0) {
          templateExprDepth--;
          index++;
          continue;
        }
        if (char === inString && templateExprDepth === 0) {
          inString = false;
          index++;
          continue;
        }
        index++;
        continue;
      }

      if (isQuoteChar(char)) {
        inString = char;
        index++;
        continue;
      }

      if (char === "{") depth++;
      else if (char === "}") depth--;
      index++;
    }

    const exprEnd = index - 1;
    const exprStart = afterBrace;
    if (exprEnd <= exprStart) continue;

    // Scan expression for string literals
    let pos = exprStart;
    while (pos < exprEnd) {
      const char = code[pos]!;

      if (char === '"' || char === "'") {
        const quote = char;
        let endPos = pos + 1;
        while (endPos < exprEnd) {
          const c = code[endPos]!;
          if (c === "\\") {
            endPos += 2;
            continue;
          }
          if (c === quote) break;
          endPos++;
        }
        const strStart = pos + 1;
        const strEnd = Math.min(endPos, exprEnd);
        if (strEnd > strStart) {
          findAkTokensInRange(strStart, strEnd);
        }
        pos = endPos + 1;
        continue;
      }

      if (char === "`") {
        pos = scanTemplateStringSegments(pos + 1, exprEnd);
        continue;
      }

      pos++;
    }
  }

  // Process object property: className: "..." or className: clsx(...)
  const propClassRegex = /\bclassName\b\s*:/g;

  while (propClassRegex.exec(code)) {
    const valueStart = propClassRegex.lastIndex;
    const exprEnd = scanExpressionForStrings(valueStart);
    propClassRegex.lastIndex = Math.max(propClassRegex.lastIndex, exprEnd);
  }

  return ranges;
}

// #endregion

// #region Main Export

/**
 * Scans the provided source code and computes per-line anchor ranges for
 * Ariakit references. This powers reference hovercards by linking:
 * - Named imports and their local identifiers
 * - Component tags and allowed props
 * - Store/function calls, including first-argument option props
 * - ak- class tokens inside strings and template literals
 *
 * Returns a list of ranges for each line in the trimmed input, ready for
 * rendering without additional position mapping.
 */
export function findCodeReferenceAnchors({
  code,
  references,
  framework,
}: FindCodeReferenceAnchorsParams): CodeReferenceAnchorRange[][] {
  const trimmed = code.trim();
  const anchors: CodeReferenceAnchorRange[] = [];

  // Fast bailout for empty references
  if (!references.length) {
    const lines = trimmed.split("\n");
    return lines.map(() => []);
  }

  // Quick pattern checks to avoid expensive parsing
  const hasComponents = trimmed.includes("<");
  const hasCalls = trimmed.includes("(");
  const hasAkClasses = trimmed.includes("ak-");
  const hasUseStoreState = trimmed.includes("useStoreState");
  const hasAriakitImport = trimmed.includes("@ariakit/");

  if (
    !hasComponents &&
    !hasCalls &&
    !hasAkClasses &&
    !hasUseStoreState &&
    !hasAriakitImport
  ) {
    const lines = trimmed.split("\n");
    return lines.map(() => []);
  }

  const { nameToRef } = getFrameworkReferences(references, framework);

  // Parse imports lazily
  let namedImports: Map<string, string> = new Map();
  let namespaceAliases: Set<string> = new Set();

  if (hasAriakitImport) {
    const parsed = parseAriakitImports(trimmed);
    namedImports = parsed.namedImports;
    namespaceAliases = parsed.namespaceAliases;
  }

  // Always parse local imports to avoid false positives
  const localImports = parseLocalImports(trimmed);
  const hasAnyImport = /(^|\n)\s*import\b/.test(trimmed);

  // Cache href lookups
  const hrefCache = new Map<string, string>();

  const getHref = (
    reference: CollectionEntry<"references">,
    item?: string,
  ): string | undefined => {
    const key = reference.id + (item ? `#${item}` : "");
    const cached = hrefCache.get(key);
    if (cached) return cached;
    const href = getReferencePath({ reference, item });
    if (href) {
      hrefCache.set(key, href);
    }
    return href;
  };

  /**
   * Gets the store reference from a callable name (handles useXxxContext ->
   * useXxxStore).
   */
  const getStoreRefFromCallableName = (name: string) => {
    const directRef = nameToRef[name];
    if (directRef?.data.kind === "store") return directRef;

    const contextMatch = /^use(.+)Context$/.exec(name);
    if (contextMatch) {
      const base = contextMatch[1]!;
      const storeName = `use${base}Store`;
      const storeRef = nameToRef[storeName];
      if (storeRef?.data.kind === "store") return storeRef;
    }

    return undefined;
  };

  // Track store variable assignments for return-prop lookups
  const storeVarToRef = new Map<string, CollectionEntry<"references">>();

  // 1) Named imports: anchor local identifiers in import statements
  if (hasAriakitImport) {
    processNamedImports(trimmed, nameToRef, anchors, getHref);
  }

  // 2) Component opening tags
  if (hasComponents) {
    processComponentTags(
      trimmed,
      nameToRef,
      namedImports,
      localImports,
      hasAnyImport,
      anchors,
      getHref,
    );
  }

  // 3) Namespaced calls: ak.useDisclosureStore(...)
  if (hasCalls) {
    processNamespacedCalls(
      trimmed,
      nameToRef,
      localImports,
      hasAnyImport,
      anchors,
      storeVarToRef,
      getHref,
      getStoreRefFromCallableName,
    );
  }

  // 4) Plain calls: useDisclosureStore(...)
  if (hasCalls) {
    processPlainCalls(
      trimmed,
      nameToRef,
      namedImports,
      localImports,
      hasAnyImport,
      anchors,
      storeVarToRef,
      getHref,
      getStoreRefFromCallableName,
    );
  }

  // 5) useStoreState state keys
  const hasUseStoreStateAvailable =
    namedImports.has("useStoreState") ||
    namespaceAliases.size > 0 ||
    !hasAnyImport;

  if (hasUseStoreStateAvailable && hasCalls) {
    processUseStoreStateCalls(trimmed, storeVarToRef, anchors, getHref);
  }

  // 6) Return-prop accesses on store variables
  if (storeVarToRef.size) {
    processStoreReturnProps(trimmed, storeVarToRef, anchors, getHref);
  }

  // 7) ak- class tokens
  if (hasAkClasses) {
    const classRanges = findClassTokenRanges(trimmed);
    for (const range of classRanges) {
      // Placeholder href for class tokens
      pushRange(anchors, range.start, range.end, "#", "prop");
    }
  }

  // Build per-line anchors
  return buildPerLineAnchors(trimmed, anchors);
}

// #endregion

// #region Processing Functions

/**
 * Processes named imports to create anchors for imported identifiers.
 */
function processNamedImports(
  code: string,
  nameToRef: NameToReference,
  anchors: CodeReferenceAnchorRange[],
  getHref: (
    ref: CollectionEntry<"references">,
    item?: string,
  ) => string | undefined,
) {
  const importRegex =
    /import\s+([\s\S]*?)\s+from\s*["'](@ariakit\/[\w-]+)(?:-core)?["']/g;
  let importMatch: RegExpExecArray | null;

  while ((importMatch = importRegex.exec(code))) {
    const clause = importMatch[1] || "";
    const blockRegex = /\{([\s\S]*?)\}/g;
    let blockMatch: RegExpExecArray | null;

    while ((blockMatch = blockRegex.exec(clause))) {
      const inside = blockMatch[1] || "";
      const fullMatch = importMatch[0] || "";
      const clauseStartInFull = fullMatch.indexOf(clause);
      const blockStartInClause = blockMatch.index || 0;
      const basePosition =
        (importMatch.index || 0) +
        (clauseStartInFull >= 0 ? clauseStartInFull : 0) +
        blockStartInClause +
        1; // position after '{'

      const specRegex = new RegExp(
        `(${IDENTIFIER_PATTERN})(?:\\s+as\\s+(${IDENTIFIER_PATTERN}))?`,
        "g",
      );
      let specMatch: RegExpExecArray | null;

      while ((specMatch = specRegex.exec(inside))) {
        const exported = specMatch[1]!;
        const local = specMatch[2] || exported;
        const ref = nameToRef[exported];
        if (!ref) continue;

        // Calculate precise position of the local name
        const specText = specMatch[0]!;
        const exportedIndex = specText.indexOf(exported);
        const localPosInSpec =
          exportedIndex === 0 && specMatch[2]
            ? specText.indexOf(local)
            : exportedIndex;
        const start =
          basePosition + (specMatch.index || 0) + Math.max(0, localPosInSpec);
        const end = start + local.length;
        const href = getHref(ref);
        const labelKind = getLabelKind(ref);

        pushRange(anchors, start, end, href, labelKind);
      }
    }
  }
}

/**
 * Processes JSX component tags to create anchors for component names and
 * props.
 */
function processComponentTags(
  code: string,
  nameToRef: NameToReference,
  namedImports: Map<string, string>,
  localImports: Map<string, string>,
  hasAnyImport: boolean,
  anchors: CodeReferenceAnchorRange[],
  getHref: (
    ref: CollectionEntry<"references">,
    item?: string,
  ) => string | undefined,
) {
  const anchorComponent = (start: number, end: number, name: string) => {
    const exportedName = namedImports.get(name) || name;
    const ref = nameToRef[exportedName];
    if (!ref) return;
    pushRange(anchors, start, end, getHref(ref), "component");
  };

  const anchorProps = (tagIndex: number, componentName: string) => {
    const exportedName = namedImports.get(componentName) || componentName;
    const ref = nameToRef[exportedName];
    if (!ref) return;

    const propRanges = findComponentPropRanges(code, tagIndex, ref);
    for (const propRange of propRanges) {
      const href = getHref(ref, getReferenceItemId("prop", propRange.name));
      pushRange(anchors, propRange.start, propRange.end, href, "prop");
    }
  };

  // Namespaced components: <ak.Disclosure ...>
  const nsCompRegex = new RegExp(
    `<(${IDENTIFIER_PATTERN})\\.(${COMPONENT_NAME_PATTERN})(?=[\\s/>])`,
    "g",
  );
  let nsMatch: RegExpExecArray | null;

  while ((nsMatch = nsCompRegex.exec(code))) {
    const fullMatch = nsMatch[0]!;
    const namespace = nsMatch[1]!;
    const componentName = nsMatch[2]!;

    // Avoid matching generics like Foo<T>
    const charBeforeLt = code[(nsMatch.index || 0) - 1] || "";
    if (NON_IDENTIFIER_CHAR_PATTERN.test(charBeforeLt)) continue;

    const dotPosition = fullMatch.lastIndexOf(".");
    const tokenStart = (nsMatch.index || 0) + dotPosition + 1;
    const tokenEnd = tokenStart + componentName.length;

    const nsSource = localImports.get(namespace);
    const isAllowedNs = nsSource?.startsWith("@ariakit/") || !hasAnyImport;

    if (isAllowedNs) {
      anchorComponent(tokenStart, tokenEnd, componentName);
      anchorProps(nsMatch.index || 0, componentName);
    }
  }

  // Direct components: <Disclosure ...>
  const compRegex = new RegExp(`<(${COMPONENT_NAME_PATTERN})(?=[\\s/>])`, "g");
  let compMatch: RegExpExecArray | null;

  while ((compMatch = compRegex.exec(code))) {
    const componentName = compMatch[1]!;

    // Avoid matching TypeScript generics
    const charBeforeLt = code[(compMatch.index || 0) - 1] || "";
    if (NON_IDENTIFIER_CHAR_PATTERN.test(charBeforeLt)) continue;

    const importedSource = localImports.get(componentName);
    const isFromAriakit = importedSource?.startsWith("@ariakit/");
    const shouldProcess = isFromAriakit || (!importedSource && !hasAnyImport);

    if (shouldProcess) {
      const start = (compMatch.index || 0) + 1; // after '<'
      const end = start + componentName.length;
      anchorComponent(start, end, componentName);
      anchorProps(compMatch.index || 0, componentName);
    }
  }
}

/**
 * Processes namespaced function calls like ak.useDisclosureStore(...).
 */
function processNamespacedCalls(
  code: string,
  nameToRef: NameToReference,
  localImports: Map<string, string>,
  hasAnyImport: boolean,
  anchors: CodeReferenceAnchorRange[],
  storeVarToRef: Map<string, CollectionEntry<"references">>,
  getHref: (
    ref: CollectionEntry<"references">,
    item?: string,
  ) => string | undefined,
  getStoreRefFromCallableName: (
    name: string,
  ) => CollectionEntry<"references"> | undefined,
) {
  const nsCallRegex = new RegExp(
    `\\b(${IDENTIFIER_PATTERN})\\.(${IDENTIFIER_PATTERN})\\s*\\(`,
    "g",
  );
  let callMatch: RegExpExecArray | null;

  while ((callMatch = nsCallRegex.exec(code))) {
    const namespace = callMatch[1]!;
    const funcName = callMatch[2]!;

    const nsSource = localImports.get(namespace);
    const isAllowedNs = nsSource?.startsWith("@ariakit/") || !hasAnyImport;
    if (!isAllowedNs) continue;

    const funcSource = localImports.get(funcName);
    if (funcSource && !funcSource.startsWith("@ariakit/")) continue;

    const ref = nameToRef[funcName];
    const storeRef = getStoreRefFromCallableName(funcName);
    if (!ref && !storeRef) continue;

    const targetRef = ref ?? storeRef;
    const labelKind = getLabelKind(targetRef);
    const start = (callMatch.index || 0) + namespace.length + 1; // after "ns."
    const end = start + funcName.length;

    if (targetRef) {
      pushRange(anchors, start, end, getHref(targetRef), labelKind);
    }

    // Track store variable assignment
    trackStoreAssignment(
      code,
      callMatch.index || 0,
      storeRef,
      ref,
      storeVarToRef,
    );

    // Process first-arg object props
    processFirstArgProps(
      code,
      callMatch.index || 0,
      ref,
      storeRef,
      anchors,
      getHref,
    );
  }
}

/**
 * Processes plain function calls like useDisclosureStore(...).
 */
function processPlainCalls(
  code: string,
  nameToRef: NameToReference,
  namedImports: Map<string, string>,
  localImports: Map<string, string>,
  hasAnyImport: boolean,
  anchors: CodeReferenceAnchorRange[],
  storeVarToRef: Map<string, CollectionEntry<"references">>,
  getHref: (
    ref: CollectionEntry<"references">,
    item?: string,
  ) => string | undefined,
  getStoreRefFromCallableName: (
    name: string,
  ) => CollectionEntry<"references"> | undefined,
) {
  const plainCallRegex = new RegExp(`\\b(${IDENTIFIER_PATTERN})\\s*\\(`, "g");
  let callMatch: RegExpExecArray | null;

  while ((callMatch = plainCallRegex.exec(code))) {
    const localName = callMatch[1]!;
    const callIndex = callMatch.index || 0;

    // Skip function declarations
    const precedingText = code.slice(Math.max(0, callIndex - 64), callIndex);
    if (
      /(?:^|[^\w])(export\s+)?(?:async\s+)?function\s*$/.test(precedingText)
    ) {
      continue;
    }

    const localSource = localImports.get(localName);
    if (localSource && !localSource.startsWith("@ariakit/")) continue;

    const exported =
      namedImports.get(localName) || (!hasAnyImport ? localName : undefined);
    if (!exported) continue;

    const ref = nameToRef[exported];
    const storeRef = getStoreRefFromCallableName(exported);
    if (!ref && !storeRef) continue;

    const targetRef = ref ?? storeRef;
    const labelKind = getLabelKind(targetRef);
    const start = callIndex;
    const end = start + localName.length;

    if (targetRef) {
      pushRange(anchors, start, end, getHref(targetRef), labelKind);
    }

    // Track store variable assignment
    trackStoreAssignment(code, callIndex, storeRef, ref, storeVarToRef, 200);

    // Process first-arg object props
    processFirstArgProps(code, callIndex, ref, storeRef, anchors, getHref);
  }
}

/**
 * Tracks store variable assignments for later return-prop lookups.
 */
function trackStoreAssignment(
  code: string,
  callIndex: number,
  storeRef: CollectionEntry<"references"> | undefined,
  ref: CollectionEntry<"references"> | undefined,
  storeVarToRef: Map<string, CollectionEntry<"references">>,
  lookbackDistance = 60,
) {
  const leftSpan = code.slice(
    Math.max(0, callIndex - lookbackDistance),
    callIndex,
  );
  const assignMatch = /(const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*$/m.exec(
    leftSpan,
  );

  if (assignMatch) {
    const varName = assignMatch[2]!;
    const refForVar =
      storeRef || (ref?.data.kind === "store" ? ref : undefined);
    if (refForVar) {
      storeVarToRef.set(varName, refForVar);
    }
  }
}

/**
 * Processes props in the first argument object of a function call.
 */
function processFirstArgProps(
  code: string,
  callIndex: number,
  ref: CollectionEntry<"references"> | undefined,
  storeRef: CollectionEntry<"references"> | undefined,
  anchors: CodeReferenceAnchorRange[],
  getHref: (
    ref: CollectionEntry<"references">,
    item?: string,
  ) => string | undefined,
) {
  const obj = findObjectLiteralAtFirstArg(code, callIndex);
  const refForProps = ref || storeRef;
  const firstParam = refForProps?.data.params?.[0];
  const firstParamProps = firstParam?.props;

  if (!obj || !refForProps || !firstParamProps?.length) return;

  const allowed = new Set(firstParamProps.map((p) => p.name));
  const keys = findTopLevelObjectKeys(code, obj.start, obj.end);

  for (const key of keys) {
    if (!allowed.has(key.name)) continue;
    const href = getHref(refForProps, getReferenceItemId("prop", key.name));
    pushRange(anchors, key.start, key.end, href, "prop");
  }
}

/**
 * Processes useStoreState calls to create anchors for state keys.
 */
function processUseStoreStateCalls(
  code: string,
  storeVarToRef: Map<string, CollectionEntry<"references">>,
  anchors: CodeReferenceAnchorRange[],
  getHref: (
    ref: CollectionEntry<"references">,
    item?: string,
  ) => string | undefined,
) {
  const useStoreRegex = new RegExp(
    `\\buseStoreState\\b|\\b(${IDENTIFIER_PATTERN})\\.useStoreState\\b`,
    "g",
  );
  let match: RegExpExecArray | null;

  while ((match = useStoreRegex.exec(code))) {
    const callIndex = match.index || 0;
    const stateRanges = findUseStoreStateStateRanges(code, callIndex);

    for (const range of stateRanges) {
      // Try to resolve reference by store variable
      const argSlice = code.slice(callIndex, callIndex + 120);
      const firstArgMatch = /useStoreState\s*\(\s*([A-Za-z_$][\w$]*)/.exec(
        argSlice,
      );
      const varName = firstArgMatch?.[1];
      const ref = varName ? storeVarToRef.get(varName) : undefined;

      if (ref) {
        const href = getHref(ref, getReferenceItemId("state", range.name));
        pushRange(anchors, range.start, range.end, href, "prop");
      }
    }
  }
}

/**
 * Processes property accesses on store variables to create anchors for
 * return-props.
 */
function processStoreReturnProps(
  code: string,
  storeVarToRef: Map<string, CollectionEntry<"references">>,
  anchors: CodeReferenceAnchorRange[],
  getHref: (
    ref: CollectionEntry<"references">,
    item?: string,
  ) => string | undefined,
) {
  for (const [varName, ref] of storeVarToRef) {
    const propAccessRegex = new RegExp(
      String.raw`\b${escapeRegExp(varName)}\s*\.\s*(${IDENTIFIER_PATTERN})`,
      "g",
    );
    let propMatch: RegExpExecArray | null;

    const allowedProps = new Set(
      ref.data.returnValue?.props?.map((p) => p.name) || [],
    );

    while ((propMatch = propAccessRegex.exec(code))) {
      const propName = propMatch[1]!;
      if (!allowedProps.has(propName)) continue;

      const matchText = propMatch[0] || "";
      const propStartInMatch = Math.max(0, matchText.lastIndexOf(propName));
      const start = (propMatch.index || 0) + propStartInMatch;
      const end = start + propName.length;
      const href = getHref(ref, getReferenceItemId("return-prop", propName));

      pushRange(anchors, start, end, href, "prop");
    }
  }
}

/**
 * Builds per-line anchor arrays from absolute-position anchors.
 */
function buildPerLineAnchors(
  code: string,
  anchors: CodeReferenceAnchorRange[],
): CodeReferenceAnchorRange[][] {
  const lines = code.split("\n");
  const byLine: CodeReferenceAnchorRange[][] = lines.map(() => []);

  // Calculate line start positions
  const lineStarts: number[] = new Array(lines.length);
  let accumulator = 0;
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
    lineStarts[lineIndex] = accumulator;
    const line = lines[lineIndex];
    if (line != null) {
      accumulator += line.length + 1; // include \n
    }
  }

  // Binary search to find line index for a position
  const findLineIndex = (position: number): number => {
    let low = 0;
    let high = lineStarts.length - 1;

    while (low <= high) {
      const mid = (low + high) >> 1;
      const start = lineStarts[mid]!;
      const next =
        mid + 1 < lineStarts.length ? lineStarts[mid + 1]! : Infinity;

      if (position < start) {
        high = mid - 1;
      } else if (position >= next) {
        low = mid + 1;
      } else {
        return mid;
      }
    }

    return Math.max(0, Math.min(lineStarts.length - 1, low));
  };

  // Assign anchors to lines with relative positions
  for (const anchor of anchors) {
    const lineIndex = findLineIndex(anchor.start);
    const lineStart = lineStarts[lineIndex]!;
    const line = lines[lineIndex];
    if (line == null) continue;

    const lineLength = line.length;
    const relativeStart = Math.max(0, anchor.start - lineStart);
    const relativeEnd = Math.min(lineLength, anchor.end - lineStart);

    if (relativeEnd > relativeStart) {
      const lineAnchors = byLine[lineIndex];
      if (lineAnchors) {
        lineAnchors.push({
          ...anchor,
          start: relativeStart,
          end: relativeEnd,
        });
      }
    }
  }

  // Sort and merge overlapping anchors on each line
  for (const lineAnchors of byLine) {
    lineAnchors.sort((a, b) => a.start - b.start);

    for (let i = 1; i < lineAnchors.length; i++) {
      const prev = lineAnchors[i - 1]!;
      const current = lineAnchors[i]!;

      if (
        current.start <= prev.end &&
        current.href === prev.href &&
        current.kind === prev.kind
      ) {
        prev.end = Math.max(prev.end, current.end);
        lineAnchors.splice(i, 1);
        i--;
      }
    }
  }

  return byLine;
}

// #endregion

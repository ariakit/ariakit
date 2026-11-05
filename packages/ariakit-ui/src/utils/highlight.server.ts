import css from "@shikijs/langs/css";
import html from "@shikijs/langs/html";
import javascript from "@shikijs/langs/javascript";
import json from "@shikijs/langs/json";
import jsx from "@shikijs/langs/jsx";
import shellscript from "@shikijs/langs/shellscript";
import tsx from "@shikijs/langs/tsx";
import typescript from "@shikijs/langs/typescript";
import githubDark from "@shikijs/themes/github-dark";
import githubLight from "@shikijs/themes/github-light";
import type { Element, ElementContent } from "hast";
import {
  addClassToHast,
  createHighlighterCoreSync,
  hastToHtml,
  splitTokens,
} from "shiki/core";
import type { ShikiTransformer } from "shiki/core";
import { createJavaScriptRegexEngine } from "shiki/engine/javascript";

// This module runs only on the server or at build time. A module that the
// browser loads must not import it, or Shiki goes to the browser too. Type
// imports are fine, because they leave no code.

// The JavaScript regex engine needs no WebAssembly, so it also works in
// bundlers and runtimes that can't load the Oniguruma WASM file.
const highlighter = createHighlighterCoreSync({
  themes: [githubLight, githubDark],
  langs: [css, html, javascript, json, jsx, shellscript, tsx, typescript],
  engine: createJavaScriptRegexEngine(),
});

/**
 * A language that `highlight` supports. `text` shows the code with no syntax
 * colors. Add a grammar to the highlighter above to support another one.
 */
export type HighlightLanguage =
  | "bash"
  | "css"
  | "html"
  | "javascript"
  | "js"
  | "json"
  | "jsx"
  | "sh"
  | "text"
  | "ts"
  | "tsx"
  | "typescript";

/**
 * Text to mark. A string marks each occurrence of the text. A tuple marks only
 * the occurrences at the zero-based indexes after the text, such as
 * `["open", 0, 2]` for the first and the third.
 */
export type HighlightWord = string | [text: string, ...occurrences: number[]];

export interface HighlightOptions {
  /** The one-based numbers of the lines to mark. */
  lines?: number[];
  /**
   * The text to mark. Occurrences count across the whole code, not per line.
   * Marks that overlap or touch become one mark, and a mark can span tokens and
   * lines.
   */
  words?: HighlightWord[];
}

export interface HighlightResult {
  /**
   * The HTML of the lines, for the inside of a `code` element. Each line is a
   * `span` element with the `line` class.
   */
  html: string;
  /** The code as plain text, such as the text to copy. */
  text: string;
}

interface TextRange {
  start: number;
  end: number;
}

function getText(node: ElementContent): string {
  if (node.type === "text") return node.value;
  if (node.type !== "element") return "";
  return node.children.map(getText).join("");
}

// Returns the ranges of the marked text in the code, sorted and merged.
function findWordRanges(code: string, words: HighlightWord[]) {
  const ranges: TextRange[] = [];
  for (const word of words) {
    const [text, ...occurrences] = typeof word === "string" ? [word] : word;
    if (!text) continue;
    let occurrence = 0;
    let index = code.indexOf(text);
    while (index !== -1) {
      if (!occurrences.length || occurrences.includes(occurrence)) {
        ranges.push({ start: index, end: index + text.length });
      }
      occurrence++;
      index = code.indexOf(text, index + 1);
    }
  }
  ranges.sort((a, b) => a.start - b.start);
  const merged: TextRange[] = [];
  for (const range of ranges) {
    const last = merged.at(-1);
    if (last && range.start <= last.end) {
      last.end = Math.max(last.end, range.end);
      continue;
    }
    merged.push({ ...range });
  }
  return merged;
}

// Splits ranges at line feeds, as each line is its own element. Returns the
// ranges of each line, with offsets from the start of that line.
function splitRangesByLine(code: string, ranges: TextRange[]) {
  const rangesByLine = new Map<number, TextRange[]>();
  let lineStart = 0;
  let rangeIndex = 0;
  for (const [lineIndex, line] of code.split("\n").entries()) {
    const lineEnd = lineStart + line.length;
    for (let i = rangeIndex; i < ranges.length; i++) {
      const range = ranges[i];
      if (!range) break;
      if (range.start >= lineEnd) break;
      const start = Math.max(range.start, lineStart);
      const end = Math.min(range.end, lineEnd);
      if (end > start) {
        const lineRanges = rangesByLine.get(lineIndex) ?? [];
        lineRanges.push({ start: start - lineStart, end: end - lineStart });
        rangesByLine.set(lineIndex, lineRanges);
      }
      // A range that ends on this line doesn't reach the next one.
      if (range.end <= lineEnd + 1) {
        rangeIndex = i + 1;
      }
    }
    lineStart = lineEnd + 1;
  }
  return rangesByLine;
}

function createMark(children: ElementContent[]): Element {
  return {
    type: "element",
    tagName: "span",
    properties: { class: "highlighted-word" },
    children,
  };
}

// Marks the tokens in each range of a line. The tokens split at the edges of
// the ranges, so each range covers whole tokens. A range with one token goes
// inside that token, so the mark can take the color of the token, and the token
// keeps its own text color. A range with more tokens wraps them.
function markTokens(line: Element, ranges: TextRange[]) {
  const bounds: TextRange[] = [];
  let column = 0;
  for (const child of line.children) {
    const length = getText(child).length;
    bounds.push({ start: column, end: column + length });
    column += length;
  }
  // From the last range, so splicing doesn't move the tokens of the others.
  for (const range of ranges.toReversed()) {
    const first = bounds.findIndex((bound) => bound.start === range.start);
    const last = bounds.findIndex((bound) => bound.end === range.end);
    if (first === -1) continue;
    if (last < first) continue;
    const children = line.children.slice(first, last + 1);
    const token = children[0];
    if (children.length === 1 && token?.type === "element") {
      token.children = [createMark(token.children)];
      continue;
    }
    line.children.splice(first, children.length, createMark(children));
  }
}

function createMarksTransformer(
  code: string,
  { lines = [], words = [] }: HighlightOptions,
): ShikiTransformer {
  const markedLines = new Set(lines);
  const wordRanges = findWordRanges(code, words);
  const rangesByLine = splitRangesByLine(code, wordRanges);
  return {
    name: "ariakit:marks",
    tokens(tokens) {
      if (!wordRanges.length) return;
      const offsets = wordRanges.flatMap((range) => [range.start, range.end]);
      return splitTokens(tokens, offsets);
    },
    line(node, lineNumber) {
      if (markedLines.has(lineNumber)) {
        addClassToHast(node, "highlighted");
      }
      const ranges = rangesByLine.get(lineNumber - 1);
      if (!ranges) return;
      markTokens(node, ranges);
    },
  };
}

/**
 * Highlights code with Shiki on the server or at build time. Pass the result to
 * a component that the browser hydrates: it never loads Shiki. Mark lines and
 * text with `options`.
 * @example
 * const code = highlight(source, "tsx", { lines: [3], words: ["count"] });
 * <pre>
 *   <code dangerouslySetInnerHTML={{ __html: code.html }} />
 * </pre>
 */
export function highlight(
  code: string,
  lang: HighlightLanguage,
  options: HighlightOptions = {},
): HighlightResult {
  const root = highlighter.codeToHast(code, {
    lang,
    themes: { light: "github-light", dark: "github-dark" },
    // Each token gets --shiki-light and --shiki-dark, and no color of its own.
    // The page styles choose between them.
    defaultColor: false,
    transformers: [createMarksTransformer(code, options)],
  });
  const pre = root.children[0];
  if (pre?.type !== "element") {
    throw new Error("Shiki returned no pre element");
  }
  const codeElement = pre.children[0];
  if (codeElement?.type !== "element") {
    throw new Error("Shiki returned no code element");
  }
  return {
    html: hastToHtml({ type: "root", children: codeElement.children }),
    text: code,
  };
}

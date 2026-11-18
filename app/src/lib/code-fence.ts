/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type {
  HighlightLanguage,
  HighlightWord,
} from "@ariakit/ui/utils/highlight.server";
import { getPreviewCodeLanguage } from "./preview-code.ts";

/** The languages that a fence can name in its first word. */
const languages = [
  "bash",
  "css",
  "diff",
  "html",
  "javascript",
  "js",
  "json",
  "jsx",
  "markdown",
  "md",
  "sh",
  "text",
  "ts",
  "tsx",
  "typescript",
] as const satisfies readonly HighlightLanguage[];

const flags = ["lineNumbers", "wrap", "prompt", "tab", "install"] as const;

type CodeFenceFlag = (typeof flags)[number];

// Diffs wait for their own design, so these names stay free for it.
const reservedNames = ["ins", "del", "previousCode"];

// Names that the design rejected or that other tools use, with the fix to show.
const hints: Record<string, string> = {
  noCopy: "Every block has a copy button.",
  copyLabel: "The copy button names the title. Set the title instead.",
  npm2yarn: "Write install.",
  packageManagers: "Write install.",
  tabGroup: "A tab group ends at anything that isn't a tab fence.",
  showLineNumbers: "Write lineNumbers.",
  "line-numbers": "Write lineNumbers.",
  filename:
    'Put the file name first, such as ```counter.tsx, or write title="…".',
  highlight: "Mark lines with a range, such as {1,3-5}.",
  mark: "Mark lines with a range, such as {1,3-5}.",
};

const optionsHint =
  'The options are lineNumbers, wrap, prompt, tab, install, maxLines=N, title="…", line ranges such as {1,3-5}, and quoted text such as "count".';

export interface CodeFenceOptions {
  /** The title of the block, from a file name or `title="…"`. */
  title?: string;
  language: HighlightLanguage;
  /** The one-based numbers of the lines to mark. */
  lines: number[];
  /** The text to mark, as the `words` option of `highlight`. */
  words: HighlightWord[];
  lineNumbers: boolean;
  wrap: boolean;
  prompt: boolean;
  maxLines?: number;
  /** The fence joins the tab fences next to it, with its title as the label. */
  tab: boolean;
  /** The fence is one npm install command, shown in package manager tabs. */
  install: boolean;
}

export interface ParseCodeFenceParams {
  /** The first word of the info string, which MDX calls `lang`. */
  lang?: string | null;
  /** The rest of the info string, which MDX calls `meta`. */
  meta?: string | null;
  code: string;
}

export interface ParseCodeFenceResult {
  options: CodeFenceOptions;
  /** A message for each mistake in the info string, with its fix. */
  errors: string[];
}

type MetaToken =
  | { type: "range"; raw: string; body: string }
  | { type: "word"; raw: string; text: string; occurrences: string }
  | { type: "pair"; raw: string; key: string; value: string }
  | { type: "name"; raw: string }
  | { type: "error"; raw: string; message: string };

// Returns the index after the quote or brace that closes the one at `start`, or
// -1 when nothing closes it.
function findClose(meta: string, start: number, close: string) {
  const end = meta.indexOf(close, start + 1);
  return end === -1 ? -1 : end + 1;
}

/**
 * Splits the meta of a fence into tokens. Quotes and braces group spaces, so
 * `title="Prompt for your agent"` and `{1, 3}` are one token each. The tokens
 * are ranges like `{1,3-5}`, quoted text with optional occurrences like
 * `"open"0,2`, `key=value` pairs whose value can be quoted, and bare names.
 */
export function tokenizeCodeFenceMeta(meta: string) {
  const tokens: MetaToken[] = [];
  let index = 0;
  while (index < meta.length) {
    const char = meta.charAt(index);
    if (/\s/.test(char)) {
      index++;
      continue;
    }
    const start = index;
    if (char === "{" || char === '"' || char === "'") {
      const end = findClose(meta, index, char === "{" ? "}" : char);
      if (end === -1) {
        const raw = meta.slice(start);
        const close = char === "{" ? "}" : char;
        tokens.push({ type: "error", raw, message: `${raw} has no ${close}.` });
        break;
      }
      index = end;
      const body = meta.slice(start + 1, end - 1);
      if (char === "{") {
        tokens.push({ type: "range", raw: meta.slice(start, end), body });
        continue;
      }
      // Occurrence numbers follow the closing quote with no space.
      while (/[\d,-]/.test(meta.charAt(index))) {
        index++;
      }
      tokens.push({
        type: "word",
        raw: meta.slice(start, index),
        text: body,
        occurrences: meta.slice(end, index),
      });
      continue;
    }
    while (index < meta.length && !/\s/.test(meta.charAt(index))) {
      const next = meta.charAt(index + 1);
      if (meta.charAt(index) === "=" && (next === '"' || next === "'")) {
        const end = findClose(meta, index + 1, next);
        index = end === -1 ? meta.length : end;
        continue;
      }
      index++;
    }
    const raw = meta.slice(start, index);
    const equals = raw.indexOf("=");
    if (equals <= 0) {
      tokens.push({ type: "name", raw });
      continue;
    }
    const key = raw.slice(0, equals);
    let value = raw.slice(equals + 1);
    const quote = value.charAt(0);
    if (quote === '"' || quote === "'") {
      if (value.length < 2 || !value.endsWith(quote)) {
        tokens.push({ type: "error", raw, message: `${raw} has no ${quote}.` });
        continue;
      }
      value = value.slice(1, -1);
    }
    tokens.push({ type: "pair", raw, key, value });
  }
  return tokens;
}

interface NumberRange {
  start: number;
  end: number;
}

// Parses "1,3-5" into the ranges 1-1 and 3-5. Returns null when the text isn't
// a list of whole numbers and ascending ranges. Callers check the bounds before
// they expand the ranges, so a typo such as {1-3000000000} fails fast.
function parseNumberRanges(text: string) {
  const ranges: NumberRange[] = [];
  for (const part of text.split(",")) {
    const match = part.trim().match(/^(\d+)(?:\s*-\s*(\d+))?$/);
    if (!match) return null;
    const start = Number(match[1]);
    const end = match[2] == null ? start : Number(match[2]);
    if (end < start) return null;
    ranges.push({ start, end });
  }
  return ranges;
}

function expandRanges(ranges: NumberRange[]) {
  const numbers: number[] = [];
  for (const { start, end } of ranges) {
    for (let number = start; number <= end; number++) {
      numbers.push(number);
    }
  }
  return numbers;
}

function countOccurrences(code: string, text: string) {
  let count = 0;
  let index = code.indexOf(text);
  while (index !== -1) {
    count++;
    index = code.indexOf(text, index + 1);
  }
  return count;
}

function isLanguage(value: string): value is (typeof languages)[number] {
  return languages.some((language) => language === value);
}

function isFlag(value: string): value is CodeFenceFlag {
  return flags.some((flag) => flag === value);
}

// A first word with a dot or a slash is a file name, such as `counter.tsx`.
function isFileName(word: string) {
  return /[./]/.test(word);
}

/**
 * Reads the info string of a fenced code block, such as
 * ```` ```counter.tsx {3} "count" lineNumbers ````, into the options of an
 * Ariakit UI code block. A first word with a dot or a slash is the title, and
 * its extension picks the language. Lines count from 1, and occurrences of a
 * word mark count from 0, like the `words` option of `highlight`. The result
 * lists every mistake, and the options skip the parts with mistakes.
 */
export function parseCodeFence({
  lang,
  meta,
  code,
}: ParseCodeFenceParams): ParseCodeFenceResult {
  const errors: string[] = [];
  const options: CodeFenceOptions = {
    language: "text",
    lines: [],
    words: [],
    lineNumbers: false,
    wrap: false,
    prompt: false,
    tab: false,
    install: false,
  };
  const lineCount = code.split("\n").length;
  const seen = new Set<string>();

  // Returns false when the name already appeared in this fence.
  const see = (name: string) => {
    if (seen.has(name)) {
      errors.push(`${name} appears twice.`);
      return false;
    }
    seen.add(name);
    return true;
  };

  if (lang && isFileName(lang)) {
    options.title = lang;
    options.language = getPreviewCodeLanguage(lang);
    seen.add("title");
  } else if (lang && isLanguage(lang)) {
    options.language = lang;
  } else if (lang) {
    errors.push(
      `${lang} isn't a supported language. Use one of ${languages.join(", ")}, or a file name such as counter.tsx.`,
    );
  }

  const readUnknown = (name: string, raw: string) => {
    if (reservedNames.includes(name)) {
      errors.push(`${raw} isn't supported yet.`);
      return;
    }
    const hint = Object.hasOwn(hints, name) ? hints[name] : optionsHint;
    errors.push(`${raw} isn't an option. ${hint}`);
  };

  const readRange = (token: Extract<MetaToken, { type: "range" }>) => {
    const ranges = parseNumberRanges(token.body);
    if (!ranges) {
      errors.push(
        `Can't read the line range ${token.raw}. Use line numbers, commas, and dashes, such as {1,3-5}.`,
      );
      return;
    }
    for (const { start, end } of ranges) {
      const number = start < 1 ? start : end;
      if (number >= 1 && number <= lineCount) continue;
      errors.push(
        `Line ${number} in ${token.raw} doesn't exist. Lines count from 1, and the code has ${lineCount}.`,
      );
      return;
    }
    options.lines.push(...expandRanges(ranges));
  };

  const readWord = (token: Extract<MetaToken, { type: "word" }>) => {
    if (!token.text) {
      errors.push(`The word mark ${token.raw} has no text.`);
      return;
    }
    const count = countOccurrences(code, token.text);
    if (!count) {
      errors.push(`${token.raw} isn't in the code.`);
      return;
    }
    if (!token.occurrences) {
      options.words.push(token.text);
      return;
    }
    const ranges = parseNumberRanges(token.occurrences);
    if (!ranges) {
      errors.push(
        `Can't read the occurrences in ${token.raw}. Use numbers, commas, and dashes, such as "${token.text}"0,2.`,
      );
      return;
    }
    const missing = ranges.find(({ end }) => end >= count);
    if (missing) {
      errors.push(
        `${token.raw} marks occurrence ${missing.end}, but the code has ${count}. Occurrences count from 0, so 0 is the first.`,
      );
      return;
    }
    options.words.push([token.text, ...expandRanges(ranges)]);
  };

  const readPair = (token: Extract<MetaToken, { type: "pair" }>) => {
    const { key, value } = token;
    if (key === "title") {
      if (lang && isFileName(lang)) {
        errors.push(
          `${token.raw} sets a second title. The file name ${lang} is already the title.`,
        );
        return;
      }
      if (!see(key)) return;
      if (!value) {
        errors.push(`${token.raw} has no text.`);
        return;
      }
      options.title = value;
      return;
    }
    if (key === "maxLines") {
      if (!see(key)) return;
      if (!/^\d+$/.test(value) || Number(value) < 1) {
        errors.push(
          `${token.raw} needs a whole number above 0, such as maxLines=10.`,
        );
        return;
      }
      options.maxLines = Number(value);
      return;
    }
    if (isFlag(key)) {
      errors.push(`${key} takes no value. Write ${key} alone.`);
      return;
    }
    readUnknown(key, token.raw);
  };

  const readName = (token: Extract<MetaToken, { type: "name" }>) => {
    const name = token.raw;
    if (isFlag(name)) {
      if (!see(name)) return;
      options[name] = true;
      return;
    }
    if (/^\/.*\/[\d,-]*$/.test(name)) {
      errors.push(
        `${name} uses slashes. Mark text with quotes, such as "${name.slice(1, name.lastIndexOf("/"))}".`,
      );
      return;
    }
    if (isFileName(name)) {
      errors.push(
        `${name} looks like a file name. Put it first, such as \`\`\`${name}, or write title="${name}".`,
      );
      return;
    }
    readUnknown(name, name);
  };

  for (const token of tokenizeCodeFenceMeta(meta ?? "")) {
    if (token.type === "error") {
      errors.push(token.message);
    } else if (token.type === "range") {
      readRange(token);
    } else if (token.type === "word") {
      readWord(token);
    } else if (token.type === "pair") {
      readPair(token);
    } else {
      readName(token);
    }
  }

  options.lines = [...new Set(options.lines)].sort((a, b) => a - b);

  if (options.prompt && options.lineNumbers) {
    errors.push(
      "prompt and lineNumbers both use the space before each line. Pick one.",
    );
  }
  if (options.tab && !options.title) {
    errors.push(
      'A tab fence needs a title, which is its tab label, such as ```toggle.tsx tab or title="…".',
    );
  }
  if (options.install) {
    const extra = [...seen].filter((name) => name !== "install");
    const marks = options.lines.length || options.words.length;
    if (options.language !== "sh" && options.language !== "bash") {
      errors.push("install needs a shell fence, such as ```sh install.");
    }
    if (extra.length || marks) {
      errors.push(
        "install takes no other options. It shows the command in package manager tabs with a prompt.",
      );
    }
    if (!getInstallCommands(code)) {
      errors.push(
        "install needs one npm install command with package names, such as npm install @ariakit/react.",
      );
    }
  }

  return { options, errors };
}

export interface InstallCommand {
  packageManager: "npm" | "pnpm" | "yarn" | "bun";
  command: string;
}

/**
 * Converts one `npm install` command into the command of each package manager.
 * Returns null when the code is anything else, such as two commands, an npm
 * flag other than `-D` or `--save-dev`, or an install without package names.
 * @example
 * getInstallCommands("npm install -D @ariakit/react");
 * // npm install -D @ariakit/react, pnpm add -D @ariakit/react,
 * // yarn add -D @ariakit/react, bun add -d @ariakit/react
 */
export function getInstallCommands(code: string): InstallCommand[] | null {
  const words = code.trim().split(/[ \t]+/);
  const [npm, install, ...rest] = words;
  if (npm !== "npm") return null;
  if (install !== "install" && install !== "i") return null;
  let dev = false;
  const packages: string[] = [];
  for (const word of rest) {
    if (word === "-D" || word === "--save-dev") {
      dev = true;
      continue;
    }
    // A flag, a shell operator, or a second line can't convert.
    if (!/^[@\w][\w@./:^~=*+-]*$/.test(word)) return null;
    packages.push(word);
  }
  if (!packages.length) return null;
  const names = packages.join(" ");
  const npmDev = dev ? "-D " : "";
  const bunDev = dev ? "-d " : "";
  return [
    { packageManager: "npm", command: `npm install ${npmDev}${names}` },
    { packageManager: "pnpm", command: `pnpm add ${npmDev}${names}` },
    { packageManager: "yarn", command: `yarn add ${npmDev}${names}` },
    { packageManager: "bun", command: `bun add ${bunDev}${names}` },
  ];
}

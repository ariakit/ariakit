/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
// @ts-nocheck Revisit this after we merge the app folder into root
import type { ThemedToken } from "shiki";
import { createHighlighterCore } from "shiki/core";
import { createOnigurumaEngine } from "shiki/engine/oniguruma";

export type CodeBlockLanguage =
  | "bash"
  | "css"
  | "html"
  | "javascript"
  | "js"
  | "jsx"
  | "json"
  | "python"
  | "text"
  | "ts"
  | "tsx"
  | "typescript";

const langByFilename = {
  bun: "bash",
  npm: "bash",
  pnpm: "bash",
  yarn: "bash",
} satisfies Record<string, CodeBlockLanguage>;

const langByExtension = {
  astro: "html",
  bash: "bash",
  cjs: "javascript",
  css: "css",
  cts: "typescript",
  html: "html",
  htm: "html",
  js: "js",
  javascript: "javascript",
  jsx: "jsx",
  json: "json",
  markdown: "text",
  md: "text",
  mdx: "text",
  mjs: "javascript",
  mts: "typescript",
  py: "python",
  python: "python",
  sh: "bash",
  svelte: "html",
  text: "text",
  ts: "ts",
  tsx: "tsx",
  txt: "text",
  typescript: "typescript",
  vue: "html",
} satisfies Record<string, CodeBlockLanguage>;

function getMappedLang(map: Record<string, CodeBlockLanguage>, key: string) {
  if (!Object.hasOwn(map, key)) return;
  return map[key];
}

export const highlighter = await createHighlighterCore({
  themes: [
    import("@shikijs/themes/dark-plus"),
    import("@shikijs/themes/github-light"),
  ],
  langs: [
    import("@shikijs/langs/javascript"),
    import("@shikijs/langs/css"),
    import("@shikijs/langs/typescript"),
    import("@shikijs/langs/tsx"),
    import("@shikijs/langs/json"),
    import("@shikijs/langs/html"),
    import("@shikijs/langs/bash"),
    import("@shikijs/langs/python"),
    import("@shikijs/langs/jsx"),
  ],
  engine: createOnigurumaEngine(import("shiki/onig.wasm")),
});

const tokensCache = new Map<string, ThemedToken[][]>();

export interface CodeToTokensParams {
  code: string;
  lang: CodeBlockLanguage;
  grammarContextCode?: string;
}

/**
 * Tokenizes code with the shared highlighter, memoizing results.
 * Reference pages repeat the same short type signatures thousands of times
 * across partial pages, so caching collapses most tokenization work into a
 * handful of unique runs. Callers must treat the returned tokens as
 * read-only.
 */
export function codeToTokens({
  code,
  lang,
  grammarContextCode,
}: CodeToTokensParams): ThemedToken[][] {
  const key = `${lang}\u0000${grammarContextCode ?? ""}\u0000${code}`;
  const cached = tokensCache.get(key);
  if (cached) return cached;
  const { tokens } = highlighter.codeToTokens(code, {
    lang,
    grammarContextCode,
    themes: {
      light: "github-light",
      dark: "dark-plus",
    },
  });
  tokensCache.set(key, tokens);
  return tokens;
}

export function getLangFromFilename(filename: string): CodeBlockLanguage {
  const normalizedFilename = filename.toLowerCase();
  const lang = getMappedLang(langByFilename, normalizedFilename);
  if (lang) return lang;
  const extension = normalizedFilename.split(".").pop();
  if (!extension) return "text";
  return getMappedLang(langByExtension, extension) ?? "text";
}

export function isLangAlias(
  filename: string,
  lang: CodeBlockLanguage,
): boolean {
  return getMappedLang(langByExtension, filename.toLowerCase()) === lang;
}

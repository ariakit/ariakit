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

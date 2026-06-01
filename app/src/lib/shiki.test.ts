/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

import { expect, test, vi } from "vitest";

vi.mock("shiki/core", () => ({
  createHighlighterCore: vi.fn(async () => ({})),
}));

vi.mock("shiki/engine/oniguruma", () => ({
  createOnigurumaEngine: vi.fn(() => ({})),
}));

vi.mock("shiki/onig.wasm", () => ({}));

const { getLangFromFilename, isLangAlias } = await import("./shiki.ts");

const cases = [
  ["index.js", "js"],
  ["index.jsx", "jsx"],
  ["index.ts", "ts"],
  ["index.tsx", "tsx"],
  ["javascript", "javascript"],
  ["typescript", "typescript"],
  ["index.mjs", "javascript"],
  ["index.cjs", "javascript"],
  ["index.mts", "typescript"],
  ["index.cts", "typescript"],
  ["package.json", "json"],
  ["style.css", "css"],
  ["index.htm", "html"],
  ["component.astro", "html"],
  ["component.vue", "html"],
  ["component.svelte", "html"],
  ["README.md", "text"],
  ["markdown", "text"],
  ["index.unknown", "text"],
  ["index.constructor", "text"],
  ["constructor", "text"],
  ["__proto__", "text"],
  ["Makefile", "text"],
  ["sh", "bash"],
  ["npm", "bash"],
  ["bun", "bash"],
  ["yarn", "bash"],
  ["pnpm", "bash"],
] as const;

test("maps filenames to loaded Shiki languages", () => {
  for (const [filename, lang] of cases) {
    expect(getLangFromFilename(filename)).toBe(lang);
  }
});

test("identifies language aliases separately from filenames", () => {
  expect(isLangAlias("sh", "bash")).toBe(true);
  expect(isLangAlias("bash", "bash")).toBe(true);
  expect(isLangAlias("typescript", "typescript")).toBe(true);
  expect(isLangAlias("md", "text")).toBe(true);
  expect(isLangAlias("markdown", "text")).toBe(true);
  expect(isLangAlias("npm", "bash")).toBe(false);
  expect(isLangAlias("script.sh", "bash")).toBe(false);
  expect(isLangAlias("README.md", "text")).toBe(false);
  expect(isLangAlias("constructor", "text")).toBe(false);
});

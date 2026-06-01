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

const { getLangFromFilename } = await import("./shiki.ts");

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
  ["component.astro", "html"],
  ["component.vue", "html"],
  ["component.svelte", "html"],
  ["README.md", "text"],
  ["index.unknown", "text"],
  ["Makefile", "text"],
  ["sh", "bash"],
  ["pnpm", "bash"],
] as const;

test("maps filenames to loaded Shiki languages", () => {
  for (const [filename, lang] of cases) {
    expect(getLangFromFilename(filename)).toBe(lang);
  }
});

/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { expect, test } from "vitest";

const rootDir = join(dirname(fileURLToPath(import.meta.url)), "../../..");
const page = readFileSync(join(rootDir, "app/src/pages/ariakit-ui.astro"), {
  encoding: "utf8",
});

const SOURCE_REFERENCE = /\{\s*file:\s*"([^"]+)",\s*line:\s*(\d+)\s*\}/g;

// The gallery points at its recipes by line number, so every edit to a linked
// file can silently move an anchor onto a blank line or into a comment body.
// That drifted repeatedly while the list recipes were being split up, and
// nothing but a reader clicking the chip would have noticed.
test("anchors every source link on a line that opens a declaration", () => {
  const references = [...page.matchAll(SOURCE_REFERENCE)];
  expect(references.length).toBeGreaterThan(0);
  const stale: string[] = [];
  for (const [, file, line] of references) {
    // Both groups are required by the pattern, so this only narrows the type.
    if (!file || !line) continue;
    const source = readFileSync(join(rootDir, file), { encoding: "utf8" });
    const target = source.split("\n")[Number(line) - 1]?.trim();
    if (!target || /^(\/\/|\/\*|\*)/.test(target)) {
      stale.push(`${file}:${line} → ${JSON.stringify(target ?? null)}`);
    }
  }
  expect(stale).toEqual([]);
});

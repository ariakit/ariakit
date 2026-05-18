/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

import { expect, test } from "vitest";
import { getNextjsPreviewId, isNextjsPreviewId } from "./nextjs.ts";

test("getNextjsPreviewId handles stripped preview ids", () => {
  expect(getNextjsPreviewId("/react/previews/tab-nextjs/")).toBe("tab-nextjs");
  expect(getNextjsPreviewId("/react/previews/tab-nextjs")).toBe("tab-nextjs");
});

test("getNextjsPreviewId handles nested ids under a Next.js preview", () => {
  expect(getNextjsPreviewId("/react/previews/counter-nextjs/nested/")).toBe(
    "counter-nextjs/nested",
  );
});

test("getNextjsPreviewId ignores source path segments", () => {
  expect(
    getNextjsPreviewId("/react/previews/sandbox/counter-nextjs/"),
  ).toBeNull();
});

test("getNextjsPreviewId ignores non-Next.js preview ids", () => {
  expect(getNextjsPreviewId("/react/previews/disclosure/")).toBeNull();
  expect(
    getNextjsPreviewId("/react/previews/counter/nested-nextjs/"),
  ).toBeNull();
});

test("isNextjsPreviewId checks the first preview id segment", () => {
  expect(isNextjsPreviewId("counter-nextjs/nested")).toBe(true);
  expect(isNextjsPreviewId("counter/nested-nextjs")).toBe(false);
});

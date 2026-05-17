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
import { getNextjsPreviewId } from "./nextjs.ts";

test("getNextjsPreviewId handles root preview ids", () => {
  expect(getNextjsPreviewId("/react/previews/tab-nextjs/")).toBe("tab-nextjs");
  expect(getNextjsPreviewId("/react/previews/menu-nextjs-app-router")).toBe(
    "menu-nextjs-app-router",
  );
});

test("getNextjsPreviewId handles nested preview ids", () => {
  expect(getNextjsPreviewId("/react/previews/sandbox/counter-nextjs/")).toBe(
    "counter-nextjs",
  );
  expect(getNextjsPreviewId("/react/previews/sandbox/counter-nextjs")).toBe(
    "counter-nextjs",
  );
});

test("getNextjsPreviewId ignores non-Next.js preview ids", () => {
  expect(getNextjsPreviewId("/react/previews/disclosure/")).toBeNull();
  expect(getNextjsPreviewId("/react/previews/disclosure/nested/")).toBeNull();
  expect(getNextjsPreviewId("/react/previews/nextjs/nested/")).toBeNull();
});

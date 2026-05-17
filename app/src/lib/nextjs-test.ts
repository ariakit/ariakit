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
});

test("getNextjsPreviewId handles nested preview ids", () => {
  expect(getNextjsPreviewId("/react/previews/sandbox/counter-nextjs/")).toBe(
    "counter-nextjs",
  );
});

test("getNextjsPreviewId ignores non-Next.js preview ids", () => {
  expect(getNextjsPreviewId("/react/previews/disclosure/")).toBeNull();
});

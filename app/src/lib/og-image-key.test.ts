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
import { getOGImageItemKey } from "./og-image-key.ts";

test("getOGImageItemKey preserves strict equality for empty values", () => {
  const defaultKey = getOGImageItemKey({});

  expect(getOGImageItemKey({ id: "" })).not.toBe(defaultKey);
  expect(getOGImageItemKey({ id: undefined })).toBe(defaultKey);

  expect(
    getOGImageItemKey({
      // @ts-expect-error Testing runtime values outside the typed API.
      framework: "",
    }),
  ).not.toBe(defaultKey);
  expect(getOGImageItemKey({ framework: undefined })).toBe(defaultKey);
});

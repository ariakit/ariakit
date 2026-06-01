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
import { getPaginationDisplayData } from "./_utils.ts";

test("getPaginationDisplayData handles empty results", () => {
  expect(
    getPaginationDisplayData({ totalCount: 0, limit: 25, offset: 0 }),
  ).toEqual({
    currentPage: 1,
    totalPages: 1,
    firstResult: 0,
    lastResult: 0,
  });
});

test("getPaginationDisplayData handles complete and partial pages", () => {
  expect(
    getPaginationDisplayData({ totalCount: 100, limit: 25, offset: 25 }),
  ).toEqual({
    currentPage: 2,
    totalPages: 4,
    firstResult: 26,
    lastResult: 50,
  });
  expect(
    getPaginationDisplayData({ totalCount: 55, limit: 25, offset: 50 }),
  ).toEqual({
    currentPage: 3,
    totalPages: 3,
    firstResult: 51,
    lastResult: 55,
  });
});

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
import { findVarNamesInString } from "./build-styles.ts";

test("findVarNamesInString finds names in nested var fallbacks", () => {
  expect(
    findVarNamesInString("var(--ak-table-px, var(--ak-frame-padding, 0))"),
  ).toEqual(["--ak-table-px", "--ak-frame-padding"]);
});

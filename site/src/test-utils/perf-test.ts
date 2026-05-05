/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

import { afterEach, expect, test } from "vitest";
import { getIntegerEnv } from "./perf.ts";

const envName = "PERF_ITERATIONS";
const originalValue = process.env[envName];

afterEach(() => {
  if (originalValue == null) {
    delete process.env[envName];
    return;
  }
  process.env[envName] = originalValue;
});

test("gets integer env values with range validation", () => {
  process.env[envName] = "3";
  expect(getIntegerEnv(envName, 10, { min: 1 })).toBe(3);

  for (const value of ["", "2.5", "0", "-1"]) {
    process.env[envName] = value;
    expect(getIntegerEnv(envName, 10, { min: 1 })).toBe(10);
  }

  process.env[envName] = "0";
  expect(getIntegerEnv(envName, 1, { min: 0 })).toBe(0);
});

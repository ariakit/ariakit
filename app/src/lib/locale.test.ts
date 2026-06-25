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
import { getCountryCode, getCurrency } from "./locale.ts";

test("getCountryCode skips empty header values", () => {
  const headers = new Headers({
    "x-country": " ",
    "cf-ipcountry": "",
    "x-vercel-ip-country": " br ",
  });

  expect(getCountryCode(headers)).toBe("br");
});

test("getCountryCode defaults to US", () => {
  const headers = new Headers({
    "x-country": "",
    "cf-ipcountry": " ",
  });

  expect(getCountryCode(headers)).toBe("US");
});

test.each([
  ["", "USD"],
  ["T", "USD"],
  ["XX", "USD"],
  ["fr", "EUR"],
  ["GB", "GBP"],
  ["IN", "INR"],
])("getCurrency maps %s to %s", (countryCode, currency) => {
  expect(getCurrency(countryCode)).toBe(currency);
});

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
import { parsePlusPriceKey } from "./price-key.ts";

test("parsePlusPriceKey parses personal and team keys", () => {
  expect(parsePlusPriceKey("ariakit-plus-usd")).toEqual({
    type: "personal",
    currency: "usd",
    countryCode: undefined,
  });
  expect(parsePlusPriceKey("ariakit-plus-team-eur-br")).toEqual({
    type: "team",
    currency: "eur",
    countryCode: "br",
  });
});

test("parsePlusPriceKey ignores prefixed keys", () => {
  expect(parsePlusPriceKey("invalid-ariakit-plus-usd")).toEqual({});
  expect(parsePlusPriceKey("team-invalid-ariakit-plus-usd")).toEqual({});
});

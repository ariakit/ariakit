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
import type { PriceData } from "#app/lib/schemas.ts";
import { getCachedPriceDeletionReason } from "./admin-price-cache.ts";

function createPrice(data: Partial<PriceData> = {}): PriceData {
  return {
    id: "price_1",
    type: "personal",
    key: "ariakit-plus-usd",
    product: "prod_1",
    amount: 29700,
    currency: "usd",
    taxBehavior: "exclusive",
    ...data,
  };
}

test("keeps prices synced during the current run", () => {
  const syncedPrice = createPrice({ id: "price_new" });
  const staleListedPrice = createPrice({ id: "price_old" });

  expect(
    getCachedPriceDeletionReason({
      price: staleListedPrice,
      activePrices: [],
      syncedPrices: new Map([[syncedPrice.key, syncedPrice]]),
    }),
  ).toBeNull();
});

test("keeps cached prices that are still active in Stripe", () => {
  const price = createPrice();

  expect(
    getCachedPriceDeletionReason({
      price,
      activePrices: [{ id: price.id, active: true }],
      syncedPrices: new Map(),
    }),
  ).toBeNull();
});

test("deletes cached prices with invalid keys", () => {
  const price = createPrice({ key: "invalid" });

  expect(
    getCachedPriceDeletionReason({
      price,
      activePrices: [],
      syncedPrices: new Map(),
    }),
  ).toBe("invalid-key");
});

test("deletes cached prices that are not active in Stripe", () => {
  const price = createPrice();

  expect(
    getCachedPriceDeletionReason({
      price,
      activePrices: [{ id: price.id, active: false }],
      syncedPrices: new Map(),
    }),
  ).toBe("inactive");
});

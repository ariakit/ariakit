/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { Stripe } from "stripe";
import { parsePlusPriceKey } from "#app/lib/price-key.ts";
import type { PriceData } from "#app/lib/schemas.ts";

export type CachedPriceDeletionReason = "invalid-key" | "inactive";

interface GetCachedPriceDeletionReasonParams {
  price: PriceData;
  activePrices: Array<Pick<Stripe.Price, "active" | "id">>;
  syncedPrices: ReadonlyMap<string, PriceData>;
}

export function getCachedPriceDeletionReason({
  price,
  activePrices,
  syncedPrices,
}: GetCachedPriceDeletionReasonParams): CachedPriceDeletionReason | null {
  // KV list metadata can lag behind writes, so keys synced during this run
  // must survive even when the listed id is stale or absent from Stripe.
  if (syncedPrices.has(price.key)) return null;

  const { type } = parsePlusPriceKey(price.key);
  if (!type) return "invalid-key";

  const stripePrice = activePrices.find((activePrice) => {
    return activePrice.id === price.id;
  });
  if (stripePrice?.active) return null;

  return "inactive";
}

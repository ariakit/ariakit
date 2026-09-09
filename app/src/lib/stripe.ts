/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
// oxlint-disable-next-line no-named-as-default
import Stripe from "stripe";
import { createLogger } from "./logger.ts";

const logger = createLogger("stripe");

const SALE_PROMO_TYPE = "ariakit-plus-sale";

function createHttpClient(enabled: boolean) {
  if (!enabled) return;
  return Stripe.createFetchHttpClient(
    async (...args: Parameters<typeof fetch>) => {
      const { info, error } = logger.start();
      const input = args[0];
      const url =
        typeof input === "string"
          ? new URL(input)
          : input instanceof URL
            ? input
            : new URL(input.url);
      const response = await fetch(...args);
      if (response.ok) {
        info(url.pathname);
      } else {
        error(url.pathname, response.status);
        error(response.status, await response.clone().text());
      }
      return response;
    },
  );
}

const key = import.meta.env.STRIPE_SECRET_KEY;
const stripe = key
  ? new Stripe(key, {
      maxNetworkRetries: 2,
      httpClient: createHttpClient(import.meta.env.DEV),
    })
  : null;

export function getStripeClient() {
  return stripe;
}

export function isSalePromo(coupon: Stripe.Coupon | Stripe.DeletedCoupon) {
  if (coupon.deleted) return false;
  return coupon.metadata?.type === SALE_PROMO_TYPE;
}

export function getPromotionCoupon(promo: Stripe.PromotionCode) {
  const coupon = promo.promotion.coupon;
  if (!coupon) return null;
  if (typeof coupon === "string") return null;
  return coupon;
}

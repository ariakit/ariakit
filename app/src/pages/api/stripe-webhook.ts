/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { APIRoute } from "astro";
import type { Stripe } from "stripe";
import {
  deletePrice,
  deletePromo,
  getPrices,
  putPrice,
  putPromo,
} from "#app/lib/kv.ts";
import { createLogger } from "#app/lib/logger.ts";
import { objectId } from "#app/lib/object.ts";
import { parsePlusPriceKey } from "#app/lib/price-key.ts";
import { badRequest, internalServerError, ok } from "#app/lib/response.ts";
import {
  getPromotionCoupon,
  getStripeClient,
  isSalePromo,
} from "#app/lib/stripe.ts";

export const prerender = false;

const logger = createLogger("stripe-webhook");

const EVENTS = {
  CheckoutSessionCompleted: "checkout.session.completed",
  CheckoutSessionAsyncPaymentSucceeded:
    "checkout.session.async_payment_succeeded",
  PriceCreated: "price.created",
  PriceUpdated: "price.updated",
  PriceDeleted: "price.deleted",
  PromotionCodeCreated: "promotion_code.created",
  PromotionCodeUpdated: "promotion_code.updated",
} satisfies Record<string, Stripe.Event.Type>;

export const POST: APIRoute = async (context) => {
  const stripe = getStripeClient();
  if (!stripe) {
    logger.error("Stripe not configured");
    return internalServerError();
  }
  const signature = context.request.headers.get("stripe-signature");
  if (!signature) {
    logger.error("No signature");
    return badRequest();
  }
  const secret = import.meta.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    logger.error("Stripe webhook secret not configured");
    return internalServerError();
  }

  const body = await context.request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    logger.error("Webhook error:", err);
    return badRequest();
  }

  if (
    event.type === EVENTS.CheckoutSessionCompleted ||
    event.type === EVENTS.CheckoutSessionAsyncPaymentSucceeded
  ) {
    // Keep payment events retryable until account fulfillment is restored.
    logger.error("Account fulfillment unavailable", event.id);
    return new Response("Account fulfillment unavailable", { status: 503 });
  }

  if (
    event.type === EVENTS.PriceCreated ||
    event.type === EVENTS.PriceUpdated
  ) {
    const price = event.data.object;
    const key = price.lookup_key;
    if (!key) {
      logger.error("Price has no lookup key", price.id);
      return ok();
    }
    const { type } = parsePlusPriceKey(key);
    if (!type) {
      logger.error("Price not a plus price", key);
      await deletePrice(key);
      return ok();
    }
    if (price.deleted || !price.active) {
      await deletePrice(key);
      return ok();
    }
    if (!price.unit_amount) {
      logger.error("Price has no unit amount", price.id);
      return ok();
    }
    await putPrice({
      id: price.id,
      type,
      key,
      product: objectId(price.product),
      amount: price.unit_amount,
      currency: price.currency,
      taxBehavior: price.tax_behavior ?? "unspecified",
    });
    logger.info("Price stored in KV store", key);
    return ok();
  }

  if (event.type === EVENTS.PriceDeleted) {
    const price = event.data.object;
    const prices = await getPrices();
    const key = prices.find((p) => p.id === price.id)?.key;
    if (!key) {
      logger.info("Price not found in KV store", price.id);
      return ok();
    }
    await deletePrice(key);
    logger.info("Price deleted from KV store", key);
    return ok();
  }

  if (
    event.type === EVENTS.PromotionCodeCreated ||
    event.type === EVENTS.PromotionCodeUpdated
  ) {
    const promo = event.data.object;
    if (promo.customer) {
      // Preserve the cached customer promotion until accounts can be resolved.
      logger.error("Customer promotions unavailable", event.id);
      return new Response("Customer promotions unavailable", { status: 503 });
    }
    let coupon = getPromotionCoupon(promo);
    if (!coupon) {
      const couponId = promo.promotion.coupon;
      if (!couponId || typeof couponId !== "string") {
        await deletePromo(promo.id);
        logger.error("Promotion code has no coupon", promo.id);
        return ok();
      }
      coupon = await stripe.coupons.retrieve(couponId);
    }
    const isSale = isSalePromo(coupon);
    if (!isSale) {
      await deletePromo(promo.id);
      logger.info("Promotion code not a plus sale", promo.id);
      return ok();
    }
    if (!promo.active || coupon.deleted || !coupon.valid) {
      await deletePromo(promo.id);
      logger.info("Promotion code not valid anymore", promo.id);
      return ok();
    }
    if (!coupon.percent_off) {
      await deletePromo(promo.id);
      logger.error("Promotion code has no percent off", promo.id);
      return ok();
    }
    await putPromo({
      id: promo.id,
      type: "sale",
      user: null,
      products: coupon.applies_to?.products ?? [],
      expiresAt: promo.expires_at ?? coupon.redeem_by,
      percentOff: coupon.percent_off,
      timesRedeemed: promo.times_redeemed,
      maxRedemptions: promo.max_redemptions,
    });
    logger.info("Promotion code added to KV store", promo.id);
    return ok();
  }

  return ok();
};

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
import { getUser } from "#app/lib/auth.ts";
import {
  deletePrice,
  deletePromo,
  getPrices,
  putPrice,
  putPromo,
} from "#app/lib/kv.ts";
import { createLogger } from "#app/lib/logger.ts";
import { objectId } from "#app/lib/object.ts";
import { badRequest, internalServerError, ok } from "#app/lib/response.ts";
import {
  getStripeClient,
  isSalePromo,
  parsePlusPriceKey,
  processCheckout,
} from "#app/lib/stripe.ts";

export const prerender = false;

const logger = createLogger("stripe-webhook");

// Lists all events in use
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

  const getUserFromCustomer = async (
    customerId?: string | Stripe.Customer | Stripe.DeletedCustomer | null,
  ) => {
    if (typeof customerId !== "string") {
      logger.error("Invalid customer ID", customerId);
      return badRequest();
    }
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) {
      logger.error("Customer deleted", customerId);
      return ok();
    }
    const { clerkId } = customer.metadata;
    if (!clerkId) {
      logger.error("Customer has no Clerk ID", customerId);
      return ok();
    }
    const user = await getUser({ context, user: clerkId });
    if (!user) {
      logger.error("User not found", clerkId);
      return ok();
    }
    return user;
  };

  if (
    event.type === EVENTS.CheckoutSessionCompleted ||
    event.type === EVENTS.CheckoutSessionAsyncPaymentSucceeded
  ) {
    const session = event.data.object;
    await processCheckout({ context, session });
    return ok();
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
      return ok();
    }
    if (price.deleted || !price.active) {
      await deletePrice(context, key);
      return ok();
    }
    if (!price.unit_amount) {
      logger.error("Price has no unit amount", price.id);
      return ok();
    }
    await putPrice(context, {
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
    const prices = await getPrices(context);
    const key = prices.find((p) => p.id === price.id)?.key;
    if (!key) {
      logger.info("Price not found in KV store", price.id);
      return ok();
    }
    await deletePrice(context, key);
    logger.info("Price deleted from KV store", key);
    return ok();
  }

  if (
    event.type === EVENTS.PromotionCodeCreated ||
    event.type === EVENTS.PromotionCodeUpdated
  ) {
    let userId: string | null = null;
    const promo = event.data.object;
    const coupon = promo.coupon;
    const isSale = isSalePromo(promo);
    if (!isSale && !promo.customer) {
      await deletePromo(context, promo.id);
      logger.info("Promotion code not a plus sale", promo.id);
      return ok();
    }
    if (promo.customer) {
      const user = await getUserFromCustomer(promo.customer);
      if (user instanceof Response) {
        await deletePromo(context, promo.id);
        return user;
      }
      userId = objectId(user);
    }
    if (!promo.active || coupon.deleted || !coupon.valid) {
      await deletePromo(context, promo.id);
      logger.info("Promotion code not valid anymore", promo.id);
      return ok();
    }
    if (!coupon.percent_off) {
      logger.error("Promotion code has no percent off", promo.id);
      return ok();
    }
    await putPromo(context, {
      id: promo.id,
      type: promo.customer ? "customer" : "sale",
      user: userId,
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

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
import { afterAll, beforeAll, beforeEach, expect, test, vi } from "vitest";
import type { PriceData } from "#app/lib/schemas.ts";
import type { POST as PostHandler } from "../stripe-webhook.ts";

const cache = vi.hoisted(() => ({
  deletePrice: vi.fn(),
  deletePromo: vi.fn(),
  getPrices: vi.fn<() => Promise<PriceData[]>>(),
  putPrice: vi.fn(),
  putPromo: vi.fn(),
  processEvent: vi.fn(),
}));

vi.mock("#app/lib/kv.ts", () => cache);
vi.mock("#app/lib/logger.ts", () => ({
  createLogger: () => ({
    info: vi.fn(),
    error: vi.fn(),
  }),
}));

const stripe = new Stripe("sk_test_account_cleanup");
const secret = "whsec_account_cleanup";
const price = {
  id: "price_personal",
  type: "personal",
  key: "ariakit-plus-usd",
  product: "prod_personal",
  amount: 29700,
  currency: "usd",
  taxBehavior: "exclusive",
} satisfies PriceData;
const stripePrice = {
  id: price.id,
  object: "price",
  active: true,
  lookup_key: price.key,
  product: price.product,
  unit_amount: price.amount,
  currency: price.currency,
  tax_behavior: price.taxBehavior,
};
const coupon = {
  id: "coupon_sale",
  object: "coupon",
  valid: true,
  percent_off: 20,
  metadata: { type: "ariakit-plus-sale" },
  applies_to: { products: [price.product] },
  redeem_by: 2_000_000_000,
};
const promo = {
  id: "promo_sale",
  object: "promotion_code",
  active: true,
  customer: null,
  promotion: { type: "coupon", coupon },
  expires_at: null,
  times_redeemed: 3,
  max_redemptions: 10,
};

let POST: typeof PostHandler;

beforeAll(async () => {
  vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_account_cleanup");
  ({ POST } = await import("../stripe-webhook.ts"));
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("STRIPE_WEBHOOK_SECRET", secret);
  cache.getPrices.mockResolvedValue([]);
});

afterAll(() => {
  vi.unstubAllEnvs();
});

function createRequest(type: Stripe.Event.Type, object: object) {
  const body = JSON.stringify({
    id: "evt_cache_update",
    object: "event",
    type,
    data: { object },
  });
  const signature = stripe.webhooks.generateTestHeaderString({
    payload: body,
    secret,
  });
  return new Request("https://ariakit.test/api/stripe-webhook", {
    method: "POST",
    body,
    headers: { "stripe-signature": signature },
  });
}

function expectNoWrites() {
  expect(cache.putPrice).not.toHaveBeenCalled();
  expect(cache.deletePrice).not.toHaveBeenCalled();
  expect(cache.putPromo).not.toHaveBeenCalled();
  expect(cache.deletePromo).not.toHaveBeenCalled();
  expect(cache.processEvent).not.toHaveBeenCalled();
}

test.each(["price.created", "price.updated"] as const)(
  "%s updates the price cache with a verified signature",
  async (type) => {
    const response = await POST({ request: createRequest(type, stripePrice) });
    expect(response.status).toBe(200);
    expect(cache.putPrice).toHaveBeenCalledExactlyOnceWith(price);
    expect(cache.processEvent).not.toHaveBeenCalled();
  },
);

test("an inactive price is removed from the cache", async () => {
  const response = await POST({
    request: createRequest("price.updated", { ...stripePrice, active: false }),
  });
  expect(response.status).toBe(200);
  expect(cache.deletePrice).toHaveBeenCalledExactlyOnceWith(price.key);
  expect(cache.putPrice).not.toHaveBeenCalled();
});

test("a deleted price is found by its Stripe ID", async () => {
  cache.getPrices.mockResolvedValue([price]);
  const response = await POST({
    request: createRequest("price.deleted", { id: price.id }),
  });
  expect(response.status).toBe(200);
  expect(cache.deletePrice).toHaveBeenCalledExactlyOnceWith(price.key);
});

test.each(["promotion_code.created", "promotion_code.updated"] as const)(
  "%s updates the public promotion cache",
  async (type) => {
    const response = await POST({ request: createRequest(type, promo) });
    expect(response.status).toBe(200);
    expect(cache.putPromo).toHaveBeenCalledExactlyOnceWith({
      id: promo.id,
      type: "sale",
      user: null,
      products: [price.product],
      expiresAt: coupon.redeem_by,
      percentOff: coupon.percent_off,
      timesRedeemed: promo.times_redeemed,
      maxRedemptions: promo.max_redemptions,
    });
  },
);

test("an inactive public promotion is removed from the cache", async () => {
  const response = await POST({
    request: createRequest("promotion_code.updated", {
      ...promo,
      active: false,
    }),
  });
  expect(response.status).toBe(200);
  expect(cache.deletePromo).toHaveBeenCalledExactlyOnceWith(promo.id);
  expect(cache.putPromo).not.toHaveBeenCalled();
});

test.each([
  "checkout.session.completed",
  "checkout.session.async_payment_succeeded",
] as const)(
  "%s remains retryable without account fulfillment",
  async (type) => {
    const response = await POST({
      request: createRequest(type, {
        id: "cs_team",
        payment_status: "paid",
        metadata: {
          plusType: "team",
          clerkId: "user_buyer",
          creditUsed: "100",
        },
      }),
    });
    expect(response.status).toBe(503);
    expectNoWrites();
  },
);

test.each(["promotion_code.created", "promotion_code.updated"] as const)(
  "%s preserves a customer promotion for retry",
  async (type) => {
    const response = await POST({
      request: createRequest(type, {
        ...promo,
        customer: "cus_buyer",
        promotion: { type: "coupon", coupon: coupon.id },
      }),
    });
    expect(response.status).toBe(503);
    expectNoWrites();
  },
);

test("an expanded customer also leaves its promotion unchanged", async () => {
  const response = await POST({
    request: createRequest("promotion_code.updated", {
      ...promo,
      active: false,
      customer: { id: "cus_buyer" },
    }),
  });
  expect(response.status).toBe(503);
  expectNoWrites();
});

test("a missing signature prevents cache writes", async () => {
  const request = createRequest("price.updated", stripePrice);
  request.headers.delete("stripe-signature");
  const response = await POST({ request });
  expect(response.status).toBe(400);
  expectNoWrites();
});

test("an invalid signature prevents cache writes", async () => {
  const request = createRequest("price.updated", stripePrice);
  request.headers.set("stripe-signature", "invalid");
  const response = await POST({ request });
  expect(response.status).toBe(400);
  expectNoWrites();
});

test("payment events also require a valid signature", async () => {
  const request = createRequest("checkout.session.completed", {
    id: "cs_team",
  });
  request.headers.set("stripe-signature", "invalid");
  const response = await POST({ request });
  expect(response.status).toBe(400);
  expectNoWrites();
});

test("a missing signing secret prevents cache writes", async () => {
  vi.stubEnv("STRIPE_WEBHOOK_SECRET", "");
  const response = await POST({
    request: createRequest("price.updated", stripePrice),
  });
  expect(response.status).toBe(500);
  expectNoWrites();
});

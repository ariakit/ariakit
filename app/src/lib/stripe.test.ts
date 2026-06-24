/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

import type { APIContext } from "astro";
import { beforeEach, expect, test, vi } from "vitest";

const authMock = vi.hoisted(() => ({
  addPlusToUser: vi.fn(),
  createTeam: vi.fn(),
  getCustomer: vi.fn(),
  getUser: vi.fn(),
  getUserId: vi.fn(),
  removePlusFromUser: vi.fn(),
  setCustomer: vi.fn(),
}));

const kvMock = vi.hoisted(() => ({
  getBestPromo: vi.fn(),
  getPrices: vi.fn(),
  isEventProcessed: vi.fn(),
  processEvent: vi.fn(),
  putPromo: vi.fn(),
}));

const stripeMock = vi.hoisted(() => ({
  couponsCreate: vi.fn(),
  couponsList: vi.fn(),
  customersCreate: vi.fn(),
  pricesRetrieve: vi.fn(),
  promotionCodesCreate: vi.fn(),
  checkoutSessionsCreate: vi.fn(),
}));

vi.mock("./auth.ts", () => authMock);

vi.mock("./kv.ts", () => kvMock);

vi.mock("stripe", () => {
  class StripeMock {
    static createFetchHttpClient = vi.fn();

    coupons = {
      create: stripeMock.couponsCreate,
      list: stripeMock.couponsList,
    };

    customers = {
      create: stripeMock.customersCreate,
    };

    prices = {
      retrieve: stripeMock.pricesRetrieve,
    };

    promotionCodes = {
      create: stripeMock.promotionCodesCreate,
    };

    checkout = {
      sessions: {
        create: stripeMock.checkoutSessionsCreate,
      },
    };
  }

  return { default: StripeMock };
});

const coupon = {
  id: "coupon_123",
  deleted: false,
  valid: true,
  percent_off: 50,
  applies_to: { products: [] },
  metadata: { type: "ariakit-plus-sale" },
};

interface StripeModule {
  createSalePromo: (params: {
    context: APIContext;
    percentOff: number;
    user?: string | null;
  }) => Promise<unknown>;
}

// Keep this path widened so the app test project doesn't type-check
// Worker-only dependencies through stripe.ts.
const stripeModulePath: string = "./stripe.ts";

function importStripeModule() {
  return import(stripeModulePath) as Promise<StripeModule>;
}

function getContext() {
  return { locals: {} } as APIContext;
}

function getStatusError(status: number) {
  return Object.assign(new Error("Clerk error"), { status });
}

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv("STRIPE_SECRET_KEY", "sk_test");
  for (const mock of Object.values(authMock)) {
    mock.mockReset();
  }
  for (const mock of Object.values(kvMock)) {
    mock.mockReset();
  }
  for (const mock of Object.values(stripeMock)) {
    mock.mockReset();
  }
  stripeMock.couponsList.mockReturnValue([coupon]);
  stripeMock.promotionCodesCreate.mockResolvedValue({ id: "promo_123" });
});

test("createSalePromo creates a Stripe customer for user promos", async () => {
  const context = getContext();
  const user = {
    id: "user_123",
    primaryEmailAddress: { emailAddress: "user@example.com" },
    privateMetadata: {},
  };
  authMock.getUser.mockResolvedValue(user);
  authMock.getCustomer.mockResolvedValue(null);
  stripeMock.customersCreate.mockResolvedValue({ id: "cus_123" });

  const { createSalePromo } = await importStripeModule();

  await createSalePromo({ context, percentOff: 50, user: user.id });

  expect(stripeMock.customersCreate).toHaveBeenCalledWith({
    email: "user@example.com",
    metadata: { clerkId: "user_123" },
  });
  expect(authMock.setCustomer).toHaveBeenCalledWith(
    context,
    "user_123",
    "cus_123",
  );
  expect(stripeMock.promotionCodesCreate).toHaveBeenCalledWith({
    promotion: {
      type: "coupon",
      coupon: "coupon_123",
    },
    customer: "cus_123",
    max_redemptions: undefined,
    expires_at: undefined,
  });
  expect(kvMock.putPromo).toHaveBeenCalledWith(
    expect.objectContaining({
      id: "promo_123",
      type: "customer",
      user: "user_123",
      percentOff: 50,
    }),
  );
});

test("createSalePromo reuses a Stripe customer for user promos", async () => {
  const context = getContext();
  const user = {
    id: "user_123",
    primaryEmailAddress: { emailAddress: "user@example.com" },
    privateMetadata: { stripeId: "cus_existing" },
  };
  authMock.getUser.mockResolvedValue(user);
  authMock.getCustomer.mockResolvedValue("cus_existing");

  const { createSalePromo } = await importStripeModule();

  await createSalePromo({ context, percentOff: 50, user: user.id });

  expect(stripeMock.customersCreate).not.toHaveBeenCalled();
  expect(authMock.setCustomer).not.toHaveBeenCalled();
  expect(stripeMock.promotionCodesCreate).toHaveBeenCalledWith({
    promotion: {
      type: "coupon",
      coupon: "coupon_123",
    },
    customer: "cus_existing",
    max_redemptions: undefined,
    expires_at: undefined,
  });
  expect(kvMock.putPromo).toHaveBeenCalledWith(
    expect.objectContaining({
      id: "promo_123",
      type: "customer",
      user: "user_123",
      percentOff: 50,
    }),
  );
});

test("createSalePromo creates sale promos without a customer", async () => {
  const context = getContext();

  const { createSalePromo } = await importStripeModule();

  await createSalePromo({ context, percentOff: 50 });

  expect(authMock.getUser).not.toHaveBeenCalled();
  expect(authMock.getCustomer).not.toHaveBeenCalled();
  expect(stripeMock.customersCreate).not.toHaveBeenCalled();
  expect(stripeMock.promotionCodesCreate).toHaveBeenCalledWith({
    promotion: {
      type: "coupon",
      coupon: "coupon_123",
    },
    customer: undefined,
    max_redemptions: undefined,
    expires_at: undefined,
  });
  expect(kvMock.putPromo).toHaveBeenCalledWith(
    expect.objectContaining({
      id: "promo_123",
      type: "sale",
      user: null,
      percentOff: 50,
    }),
  );
});

test("createSalePromo rejects user promos with an unresolved user", async () => {
  const context = getContext();
  authMock.getUser.mockRejectedValue(getStatusError(404));
  authMock.getCustomer.mockResolvedValue(null);

  const { createSalePromo } = await importStripeModule();

  await expect(
    createSalePromo({ context, percentOff: 50, user: "user_123" }),
  ).rejects.toThrow("Cannot create a customer promo: user not found");

  expect(stripeMock.couponsList).not.toHaveBeenCalled();
  expect(stripeMock.couponsCreate).not.toHaveBeenCalled();
  expect(stripeMock.customersCreate).not.toHaveBeenCalled();
  expect(stripeMock.promotionCodesCreate).not.toHaveBeenCalled();
  expect(kvMock.putPromo).not.toHaveBeenCalled();
});

test("createSalePromo preserves user lookup failures", async () => {
  const context = getContext();
  const error = getStatusError(500);
  authMock.getUser.mockRejectedValue(error);

  const { createSalePromo } = await importStripeModule();

  await expect(
    createSalePromo({ context, percentOff: 50, user: "user_123" }),
  ).rejects.toBe(error);

  expect(stripeMock.couponsList).not.toHaveBeenCalled();
  expect(stripeMock.couponsCreate).not.toHaveBeenCalled();
  expect(stripeMock.customersCreate).not.toHaveBeenCalled();
  expect(stripeMock.promotionCodesCreate).not.toHaveBeenCalled();
  expect(kvMock.putPromo).not.toHaveBeenCalled();
});

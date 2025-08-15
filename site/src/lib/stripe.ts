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
import { Stripe } from "stripe";
import { findInOrder } from "./array.ts";
import type { User } from "./auth.ts";
import {
  addPlusToUser,
  createTeam,
  getCustomer,
  getUser,
  getUserId,
  removePlusFromUser,
  setCustomer,
} from "./auth.ts";
import { getUnixTime } from "./datetime.ts";
import {
  getBestPromo,
  getPrices,
  isEventProcessed,
  processEvent,
  putPromo,
} from "./kv.ts";
import { getCountryCode, getCurrency } from "./locale.ts";
import { createLogger } from "./logger.ts";
import { objectId } from "./object.ts";
import {
  type PlusType,
  PlusTypeSchema,
  type PriceData,
  type PromoData,
} from "./schemas.ts";

const logger = createLogger("stripe");

const SALE_PROMO_TYPE = "ariakit-plus-sale";

function createHttpClient(enabled: boolean) {
  if (!enabled) return;
  return Stripe.createFetchHttpClient(
    async (...args: Parameters<typeof fetch>) => {
      const { info, error } = logger.start();
      const url = new URL(args[0].toString());
      const response = await fetch(...args);
      if (response.ok) {
        info(url.pathname);
      } else {
        error(url.pathname, response.status);
        error(response.status, await response.text());
      }
      return response;
    },
  );
}

const key = import.meta.env?.STRIPE_SECRET_KEY;
const stripe = key
  ? new Stripe(key, {
      maxNetworkRetries: 2,
      httpClient: createHttpClient(import.meta.env.DEV),
    })
  : null;

function compareCurrency(a?: string | null, b?: string | null) {
  if (!a || !b) return false;
  return a.toLowerCase() === b.toLowerCase();
}

export function getStripeClient() {
  return stripe;
}

export function expanded(
  object: string | { id: string },
  message: string | Error = "Stripe object is not expanded",
): asserts object is { id: string } {
  if (typeof object === "object") return;
  if (typeof message === "string") {
    message = new Error(message);
  }
  throw message;
}

export function isSalePromo(promo: Stripe.PromotionCode | Stripe.Coupon) {
  const coupon = "coupon" in promo ? promo.coupon : promo;
  return coupon.metadata?.type === SALE_PROMO_TYPE;
}

export interface CreateSalePromoParams {
  context: APIContext;
  percentOff: number;
  user?: User | string | null;
  expiresAt?: Date;
  maxRedemptions?: number;
}

export async function createSalePromo({
  context,
  percentOff,
  user,
  expiresAt,
  maxRedemptions,
}: CreateSalePromoParams) {
  if (!stripe) return;
  const coupons: Stripe.Coupon[] = [];
  for await (const coupon of stripe.coupons.list({ limit: 100 })) {
    if (!isSalePromo(coupon)) continue;
    coupons.push(coupon);
  }
  let coupon = coupons.find((coupon) => {
    if (coupon.deleted) return false;
    if (!coupon.valid) return false;
    if (coupon.percent_off !== percentOff) return false;
    if (coupon.applies_to?.products.length) return false;
    return true;
  });

  if (!coupon) {
    const name = `${percentOff}% off`;
    coupon = await stripe.coupons.create({
      name,
      percent_off: percentOff,
      metadata: { type: SALE_PROMO_TYPE },
    });
  }

  const customer = user ? await getCustomer({ context, user }) : undefined;
  const expiresAtTime = expiresAt ? getUnixTime(expiresAt) : undefined;

  const promo = await stripe.promotionCodes.create({
    coupon: coupon.id,
    customer: customer || undefined,
    max_redemptions: maxRedemptions,
    expires_at: expiresAtTime,
  });
  await putPromo(context, {
    id: promo.id,
    type: user ? "customer" : "sale",
    user: user ? objectId(user) : null,
    percentOff,
    expiresAt: expiresAtTime ?? null,
    maxRedemptions: maxRedemptions ?? null,
    products: [],
    timesRedeemed: 0,
  });
  return promo;
}

export interface CreateCustomerParams extends Stripe.CustomerCreateParams {
  context: APIContext;
  user: User | string;
  email?: string;
}

export async function createCustomer({
  context,
  user,
  email,
  ...params
}: CreateCustomerParams) {
  if (!stripe) return;
  const userId = objectId(user);
  const customer = await stripe.customers.create({
    email,
    ...params,
    metadata: { ...params?.metadata, clerkId: userId },
  });
  await setCustomer(context, userId, customer.id);
  return customer;
}

export interface GetPlusPriceKeyParams {
  type?: PlusType;
  currency?: string;
  countryCode?: string;
}

export function getPlusPriceKey({
  type = "personal",
  currency = "USD",
  countryCode,
}: GetPlusPriceKeyParams) {
  const isPersonal = type === "personal";
  const lowercaseCurrency = currency.toLowerCase();
  const country = countryCode ? `-${countryCode.toLowerCase()}` : "";
  return isPersonal
    ? `ariakit-plus-${lowercaseCurrency}${country}`
    : `ariakit-plus-${type}-${lowercaseCurrency}${country}`;
}

export function parsePlusPriceKey(key: string) {
  const match = key.match(/ariakit-plus-(?:team-)?([a-z]+)(?:-([a-z]{2}))?$/);
  if (!match) return {};
  const [, currency, countryCode] = match;
  if (!currency) return {};
  return {
    type: key.includes("team-") ? ("team" as const) : ("personal" as const),
    currency,
    countryCode,
  };
}

export interface PlusPrice
  extends PriceData,
    Pick<
      PromoData,
      "percentOff" | "expiresAt" | "maxRedemptions" | "timesRedeemed"
    > {
  originalAmount: number;
  credit: number;
  promo: string | null;
}

export interface GetPlusPriceParams {
  context: APIContext;
  type?: PlusType;
  user?: User | string | null;
  currency?: string;
  countryCode?: string;
}

export async function getPlusPrice({
  context,
  user,
  type = "personal",
  countryCode = getCountryCode(context.request.headers),
  currency = getCurrency(countryCode),
}: GetPlusPriceParams) {
  if (!stripe) return null;
  const keys = [
    getPlusPriceKey({ type, currency, countryCode }),
    getPlusPriceKey({ type, currency }),
    getPlusPriceKey({ type, currency: "USD" }),
  ];
  const prices = await getPrices(context, keys);
  if (!prices.length) return null;
  const price = findInOrder(prices, "key", keys);
  if (!price) return null;
  let credit = 0;
  const userId = await getUserId({ context, user });

  if (type === "team") {
    const userObject = await getUser({ context, user });
    const metadata = userObject?.privateMetadata;
    if (metadata?.credit && compareCurrency(currency, metadata.currency)) {
      credit = metadata.credit;
    }
  }

  const originalAmount = price.amount - credit;
  const promo = await getBestPromo({
    context,
    user: userId,
    product: price.product,
  });
  const amount =
    originalAmount - originalAmount * ((promo?.percentOff ?? 0) / 100);
  return {
    ...price,
    originalAmount,
    amount,
    credit,
    promo: promo?.id ?? null,
    percentOff: promo?.percentOff ?? 0,
    expiresAt: promo?.expiresAt ?? null,
    maxRedemptions: promo?.maxRedemptions ?? null,
    timesRedeemed: promo?.timesRedeemed ?? 0,
  } satisfies PlusPrice;
}

export interface CreateCheckoutParams {
  context: APIContext;
  price: PlusPrice;
  user?: User | string | null;
  returnUrl?: string | URL;
}

export async function createCheckout({
  context,
  price,
  user,
  returnUrl = context.url,
}: CreateCheckoutParams) {
  if (!stripe) return;
  const stripePrice = await stripe.prices.retrieve(price.id);
  user = await getUser({ context, user });
  if (!user) {
    return logger.error("User not found", user);
  }
  let customer = await getCustomer({ context, user });
  if (!customer) {
    const email = user.primaryEmailAddress?.emailAddress;
    const newCustomer = await createCustomer({ context, email, user });
    customer = newCustomer?.id || null;
    if (!customer) {
      return logger.error("Failed to create customer", user.id);
    }
  }

  const url = new URL(returnUrl);
  url.searchParams.set("session_id", "_CHECKOUT_SESSION_ID_");

  const isSamePrice =
    price.originalAmount === stripePrice.unit_amount &&
    price.taxBehavior === stripePrice.tax_behavior &&
    compareCurrency(price.currency, stripePrice.currency);

  const lineItem: Stripe.Checkout.SessionCreateParams.LineItem = isSamePrice
    ? { price: price.id, quantity: 1 }
    : {
        quantity: 1,
        price_data: {
          product: price.product,
          currency: price.currency,
          unit_amount: price.originalAmount,
          tax_behavior: price.taxBehavior,
        },
      };

  const session = await stripe.checkout.sessions.create({
    customer,
    line_items: [lineItem],
    mode: "payment",
    ui_mode: "embedded",
    invoice_creation: { enabled: true },
    automatic_tax: { enabled: true },
    tax_id_collection: { enabled: true },
    customer_update: { name: "auto", address: "auto" },
    discounts: price.promo ? [{ promotion_code: price.promo }] : [],
    return_url: url
      .toString()
      .replace("_CHECKOUT_SESSION_ID_", "{CHECKOUT_SESSION_ID}"),
    metadata: {
      clerkId: user.id,
      plusType: price.type,
      creditUsed: price.credit,
    },
    payment_intent_data: {
      metadata: {
        clerkId: user.id,
        plusType: price.type,
        creditUsed: price.credit,
      },
    },
  });

  return session;
}

export interface ProcessCheckoutParams {
  context: APIContext;
  session: Stripe.Checkout.Session | string;
}

export async function processCheckout({
  context,
  session,
}: ProcessCheckoutParams) {
  const stripe = getStripeClient();
  if (!stripe) return;
  if (typeof session === "string") {
    try {
      session = await stripe.checkout.sessions.retrieve(session);
    } catch (error) {
      return logger.error("Failed to retrieve checkout session", error);
    }
  }
  if (session.payment_status === "unpaid") {
    return logger.error("Checkout session not paid", session.id);
  }
  const { plusType, clerkId, creditUsed } = session.metadata ?? {};
  if (!plusType) {
    return logger.error("No plus type in session metadata", session.id);
  }
  const { success, data: type } = PlusTypeSchema.safeParse(plusType);
  if (!success) {
    return logger.error("Invalid plus type in session metadata", session.id);
  }
  if (!clerkId) {
    return logger.error("No clerk ID in session metadata", session.id);
  }
  if (await isEventProcessed(context, session.id)) {
    logger.info("Checkout session already processed", session.id);
    return session;
  }
  await processEvent(context, session.id);
  if (type === "team") {
    if (Number(creditUsed)) {
      await removePlusFromUser({ context, user: clerkId });
    }
    await createTeam({ context, user: clerkId });
  } else {
    await addPlusToUser({
      context,
      type,
      user: clerkId,
      amount: session.amount_total ?? 0,
      currency: session.currency ?? "usd",
    });
  }
  return session;
}

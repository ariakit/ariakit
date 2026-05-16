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
// oxlint-disable-next-line no-named-as-default
import Stripe from "stripe";
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
import type { PlusType, PriceData, PromoData } from "./schemas.ts";
import { PlusTypeSchema } from "./schemas.ts";

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
        error(response.status, await response.text());
      }
      return response;
    },
  );
}

const stripeClients = new Map<string, Stripe>();

function compareCurrency(a?: string | null, b?: string | null) {
  if (!a || !b) return false;
  return a.toLowerCase() === b.toLowerCase();
}

type StripeEnv = Pick<Cloudflare.Env, "STRIPE_SECRET_KEY">;

export function getStripeClient(env: StripeEnv) {
  const key = env.STRIPE_SECRET_KEY;
  if (!key) return null;
  const stripe = stripeClients.get(key);
  if (stripe) return stripe;
  const client = new Stripe(key, {
    maxNetworkRetries: 2,
    httpClient: createHttpClient(import.meta.env.DEV),
  });
  stripeClients.set(key, client);
  return client;
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
  const coupon = "promotion" in promo ? promo.promotion.coupon : promo;
  if (!coupon || typeof coupon === "string" || coupon.deleted) return false;
  return coupon.metadata?.type === SALE_PROMO_TYPE;
}

export function getPromotionCoupon(promo: Stripe.PromotionCode) {
  const coupon = promo.promotion.coupon;
  if (!coupon || typeof coupon === "string") return null;
  return coupon;
}

export interface CreateSalePromoParams {
  context: APIContext;
  env: Cloudflare.Env;
  percentOff: number;
  user?: User | string | null;
  expiresAt?: Date;
  maxRedemptions?: number;
}

export async function createSalePromo({
  context,
  env,
  percentOff,
  user,
  expiresAt,
  maxRedemptions,
}: CreateSalePromoParams) {
  const stripe = getStripeClient(env);
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

  const customer = user ? await getCustomer({ context, env, user }) : undefined;
  const expiresAtTime = expiresAt ? getUnixTime(expiresAt) : undefined;

  const promo = await stripe.promotionCodes.create({
    promotion: {
      type: "coupon",
      coupon: coupon.id,
    },
    customer: customer || undefined,
    max_redemptions: maxRedemptions,
    expires_at: expiresAtTime,
  });
  await putPromo(env, {
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
  env: Cloudflare.Env;
  user: User | string;
  email?: string;
}

export async function createCustomer({
  context,
  env,
  user,
  email,
  ...params
}: CreateCustomerParams) {
  const stripe = getStripeClient(env);
  if (!stripe) return;
  const userId = objectId(user);
  const customer = await stripe.customers.create({
    email,
    ...params,
    metadata: { ...params?.metadata, clerkId: userId },
  });
  await setCustomer(context, env, userId, customer.id);
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
  extends
    PriceData,
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
  env: Cloudflare.Env;
  type?: PlusType;
  user?: User | string | null;
  currency?: string;
  countryCode?: string;
}

export async function getPlusPrice({
  context,
  env,
  user,
  type = "personal",
  countryCode = getCountryCode(context.request.headers),
  currency = getCurrency(countryCode),
}: GetPlusPriceParams): Promise<PlusPrice | null> {
  const stripe = getStripeClient(env);
  if (!stripe) return null;
  if (!env.PLUS) return null;
  const keys = [
    getPlusPriceKey({ type, currency, countryCode }),
    getPlusPriceKey({ type, currency }),
    getPlusPriceKey({ type, currency: "USD" }),
  ];
  const prices = await getPrices(env, keys);
  if (!prices.length) return null;
  const price = findInOrder(prices, "key", keys);
  if (!price) return null;
  let credit = 0;
  const userId = await getUserId({ context, env, user });

  if (type === "team") {
    const userObject = await getUser({ context, env, user });
    const metadata = userObject?.privateMetadata;
    if (metadata?.credit && compareCurrency(currency, metadata.currency)) {
      credit = metadata.credit;
    }
  }

  const originalAmount = price.amount - credit;
  const promo = await getBestPromo({
    env,
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
  env: Cloudflare.Env;
  price: PlusPrice;
  user?: User | string | null;
  returnUrl?: string | URL;
}

export async function createCheckout({
  context,
  env,
  price,
  user,
  returnUrl = context.url,
}: CreateCheckoutParams) {
  const stripe = getStripeClient(env);
  if (!stripe) return;
  const stripePrice = await stripe.prices.retrieve(price.id);
  user = await getUser({ context, env, user });
  if (!user) {
    return logger.error("User not found", user);
  }
  let customer = await getCustomer({ context, env, user });
  if (!customer) {
    const email = user.primaryEmailAddress?.emailAddress;
    const newCustomer = await createCustomer({ context, email, env, user });
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

  const lineItem = isSamePrice
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
    ui_mode: "embedded_page",
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
  env: Cloudflare.Env;
  session: Stripe.Checkout.Session | string;
}

export async function processCheckout({
  context,
  env,
  session,
}: ProcessCheckoutParams) {
  const stripe = getStripeClient(env);
  if (!stripe) return;
  if (!env.EVENTS) return;
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
  if (await isEventProcessed(env, session.id)) {
    logger.info("Checkout session already processed", session.id);
    return session;
  }
  await processEvent(env, session.id);
  if (type === "team") {
    if (Number(creditUsed)) {
      await removePlusFromUser({ context, env, user: clerkId });
    }
    await createTeam({ context, env, user: clerkId });
  } else {
    await addPlusToUser({
      context,
      env,
      type,
      user: clerkId,
      amount: session.amount_total ?? 0,
      currency: session.currency ?? "usd",
    });
  }
  return session;
}

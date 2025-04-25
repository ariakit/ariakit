import get from "lodash-es/get.js";
import { Stripe } from "stripe";
import invariant from "tiny-invariant";
import { getPrimaryEmailAddress, updateUserWithStripeId } from "./clerk.ts";
import type { ClerkClient, User } from "./clerk.ts";

type Discount = Stripe.Coupon | Stripe.PromotionCode;

const PLUS_PRICES = {
  USD: "ariakit-plus-usd",
  EUR: "ariakit-plus-eur",
  GBP: "ariakit-plus-gbp",
  INR: "ariakit-plus-inr",
};

const key = import.meta.env.STRIPE_SECRET_KEY;
const stripe = key ? new Stripe(key) : null;

export function getStripeClient() {
  return stripe;
}

function getDiscountCoupon(discount: Discount): Stripe.Coupon;
function getDiscountCoupon(discount?: Discount): Stripe.Coupon | undefined;
function getDiscountCoupon(discount?: Discount) {
  if (!discount) return;
  if (discount.object === "coupon") return discount;
  return discount.coupon;
}

function getDiscountExpirationDateMs(discount?: Discount) {
  if (!discount) return null;
  const date =
    discount.object === "promotion_code"
      ? discount.expires_at
      : discount.redeem_by;
  if (!date) return null;
  return date * 1000;
}

function getHighestDiscount(discounts?: Discount[]) {
  if (!discounts?.length) return;
  const highestDiscount = discounts.reduce((highest, discount) => {
    const highestCoupon = getDiscountCoupon(highest);
    const coupon = getDiscountCoupon(discount);
    const percent = coupon.percent_off ?? 0;
    if (!highestCoupon.percent_off) return discount;
    if (percent > highestCoupon.percent_off) return discount;
    return highest;
  });
  return highestDiscount;
}

function applyDiscount(
  value: number,
  coupon?: Pick<Stripe.Coupon, "amount_off" | "percent_off">,
) {
  if (!coupon) return value;
  const amount = coupon.amount_off ?? 0;
  const percent = coupon.percent_off ?? 0;
  return value - amount - value * (percent / 100);
}

function clamp(value: number, min: number, max: number) {
  return Math.max(Math.min(value, max), min);
}

function getPercentOff(originalAmount: number, amount: number) {
  const percentOff = Math.round(
    ((originalAmount - amount) / originalAmount) * 100,
  );
  return clamp(percentOff, 0, 100);
}

async function expand<T extends { id: string }>(
  resource: {
    retrieve: (
      id: string,
      params: { expand?: string[] },
    ) => Promise<Stripe.Response<T>>;
  },
  object: T | string,
  expand?: string[],
) {
  if (expand?.some((e) => typeof get(object, e) !== "object")) {
    if (typeof object !== "string") {
      object = object.id;
    }
  }
  if (typeof object === "string") {
    return resource.retrieve(object, { expand });
  }
  return object;
}

export function getObjectId(object: string | { id: string }) {
  return typeof object === "string" ? object : object.id;
}

export async function createCustomerWithClerkUser(
  clerk: ClerkClient,
  user: User,
  params?: Stripe.CustomerCreateParams,
) {
  if (!stripe) return;
  const email = getPrimaryEmailAddress(user);
  params = {
    email,
    ...params,
    metadata: { ...params?.metadata, clerkId: user.id },
  };
  const customer = await stripe.customers.create(params, {
    idempotencyKey: user.id,
  });
  await updateUserWithStripeId(clerk, user.id, customer.id);
  return customer;
}

export interface ListPlusPricesParams {
  currency?: keyof typeof PLUS_PRICES;
}

export async function listPlusPrices({
  currency = "USD",
}: ListPlusPricesParams = {}) {
  if (!stripe) return;
  const prices = await stripe.prices.list({
    type: "one_time",
    active: true,
    lookup_keys: [PLUS_PRICES[currency]],
  });

  return prices.data;
}

export async function getPlusProduct(plusPrices?: Stripe.Price[]) {
  if (!stripe) return;

  plusPrices = plusPrices || (await listPlusPrices());
  const price = plusPrices?.at(0);
  invariant(price, "Price not found");

  return expand(stripe.products, price.product);
}

export async function getPlusProductId(plusPrices?: Stripe.Price[]) {
  if (!stripe) return;
  plusPrices = plusPrices || (await listPlusPrices());
  const price = plusPrices?.at(0);
  invariant(price, "Price not found");
  return getObjectId(price.product);
}

export async function getActivePlusPrice(customer?: string) {
  if (!stripe) return;
  if (!customer) return;

  const plusPrices = await listPlusPrices();
  invariant(plusPrices, "Prices not found");

  const product = await getPlusProductId(plusPrices);
  invariant(product, "Product not found");

  for await (const pi of stripe.paymentIntents.list({
    customer,
    limit: 100,
    expand: ["data.latest_charge"],
  })) {
    if (pi.status !== "succeeded") continue;
    if (pi.metadata.product !== product) continue;
    const charge = pi.latest_charge;
    if (!charge) continue;
    if (typeof charge !== "object") continue;
    if (!charge.paid) continue;
    if (charge.refunded) continue;
    const price = pi.metadata.price;
    return { price, product };
  }

  return;
}

interface GetDiscountParams {
  amount?: number | null;
  product?: string;
  customer?: string;
  discounts?: Discount[];
  promotionCode?: string;
}

export async function getDiscount({
  amount,
  product,
  customer,
  discounts,
  promotionCode,
}: GetDiscountParams) {
  if (!stripe) return;
  const promises: Stripe.ApiListPromise<Stripe.PromotionCode>[] = [];
  const coupons: Stripe.Coupon[] = [];

  // Get all promotion codes for specific customer
  if (customer) {
    promises.push(
      stripe.promotionCodes.list({
        customer,
        active: true,
        limit: 100,
      }),
    );
  }

  if (promotionCode) {
    promises.push(
      stripe.promotionCodes.list({
        active: true,
        code: promotionCode,
      }),
    );
  }

  for await (const coupon of stripe.coupons.list({ limit: 100 })) {
    if (coupon.deleted) continue;
    if (!coupon.valid) continue;
    if (product) {
      if (coupon.applies_to?.products.length) {
        if (!coupon.applies_to.products.includes(product)) continue;
      }
    }
    coupons.push(coupon);
    if (coupon.metadata?.type !== "sale") continue;
    promises.push(
      stripe.promotionCodes.list({
        coupon: coupon.id,
        active: true,
        limit: 100,
      }),
    );
  }

  const codes = (await Promise.all(promises))
    .flatMap((c) => c.data)
    // Filter out codes that are not for the customer
    .filter((c) => !c.customer || getObjectId(c.customer) === customer);

  const highestDiscount = getHighestDiscount(
    discounts ? [...codes, ...discounts] : codes,
  );

  if (!customer) return highestDiscount;
  if (!amount) return highestDiscount;

  const coupon = getDiscountCoupon(highestDiscount);
  if (!coupon) return highestDiscount;

  const finalAmount = applyDiscount(amount, {
    percent_off: coupon?.percent_off || null,
    amount_off: coupon?.amount_off || null,
  });
  if (!finalAmount) return highestDiscount;

  const percentOff = getPercentOff(amount, finalAmount);
  const discount = coupons.find(
    (coupon) =>
      coupon.percent_off === percentOff &&
      coupon.metadata?.auto_generated === "true",
  );

  const expirationDateMs = getDiscountExpirationDateMs(highestDiscount);
  const redeemBy = expirationDateMs
    ? Math.round(expirationDateMs / 1000)
    : null;

  if (discount) {
    return Object.assign(discount, { redeem_by: redeemBy });
  }

  const key = `discount-${percentOff}`;
  const nextCoupon = await stripe.coupons.create(
    {
      name: `${percentOff}% off`,
      percent_off: percentOff,
      duration: "once",
      metadata: { auto_generated: "true" },
    },
    { idempotencyKey: key },
  );

  return Object.assign(nextCoupon, { redeem_by: redeemBy });
}

export interface CreateCheckoutParams {
  price: Stripe.Price | string;
  customer: string;
  redirectUrl: string | URL;
  discount?: Discount | null;
}

export async function createCheckout({
  price,
  customer,
  redirectUrl,
  discount,
}: CreateCheckoutParams) {
  if (!stripe) return;
  price = await expand(stripe.prices, price);

  const url = new URL(redirectUrl);
  const returnUrl = new URL("/plus/success", url.origin);
  returnUrl.searchParams.set("session_id", "_CHECKOUT_SESSION_ID_");
  returnUrl.searchParams.set("redirect_url", url.toString());

  const session = await stripe.checkout.sessions.create({
    customer,
    line_items: [{ price: price.id, quantity: 1 }],
    mode: "payment",
    ui_mode: "embedded",
    invoice_creation: { enabled: true },

    return_url: returnUrl
      .toString()
      .replace("_CHECKOUT_SESSION_ID_", "{CHECKOUT_SESSION_ID}"),
    payment_intent_data: {
      metadata: {
        price: price.id,
        product: getObjectId(price.product),
      },
    },
    discounts: discount
      ? [
          discount.object === "coupon"
            ? { coupon: discount.id }
            : { promotion_code: discount.id },
        ]
      : [],
  });

  return session;
}

export async function getCheckout(session: Stripe.Checkout.Session | string) {
  if (!stripe) return;
  try {
    return expand(stripe.checkout.sessions, session);
  } catch (error) {
    console.error(error);
    return;
  }
}

export interface GetPlusPriceParams {
  customer: string;
  promotionCode?: string;
  currency?: keyof typeof PLUS_PRICES;
}

export interface PlusPrice {
  id: string;
  currency: string;
  amount: number;
  product: string;
  percentOff: number;
  originalAmount: number;
  expiresAt: number | null;
  discount: Discount | null;
}

export async function getPlusPrice({
  customer,
  promotionCode,
  currency = "USD",
}: GetPlusPriceParams) {
  if (!stripe) return;
  const prices = await listPlusPrices({ currency });
  if (!prices) return;
  const price = prices.at(0);
  if (!price) return null;
  if (!price.unit_amount) return null;

  const product = getObjectId(price.product);
  const discount = await getDiscount({
    customer,
    product,
    amount: price.unit_amount,
    promotionCode,
  });

  const expiresAt = getDiscountExpirationDateMs(discount);
  const amount = applyDiscount(price.unit_amount, getDiscountCoupon(discount));
  const percentOff = getPercentOff(price.unit_amount, amount);

  return {
    id: price.id,
    product,
    currency: price.currency,
    originalAmount: price.unit_amount,
    amount,
    percentOff,
    expiresAt,
    discount: discount ?? null,
  } satisfies PlusPrice;
}

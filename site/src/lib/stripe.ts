import type { APIContext } from "astro";
import get from "lodash-es/get.js";
import { Stripe } from "stripe";
import invariant from "tiny-invariant";
import { findInOrder } from "./array.ts";
import { getCurrentCustomer, updateUserPrivateMetadata } from "./clerk.ts";
import type { User } from "./clerk.ts";
import { createLogger } from "./logger.ts";
import type { PlusType } from "./schemas.ts";

type Discount = Stripe.Coupon | Stripe.PromotionCode;

const logger = createLogger("stripe");

function createHttpClient(enabled: boolean) {
  if (!enabled) return;
  return Stripe.createFetchHttpClient(
    async (...args: Parameters<typeof fetch>) => {
      const startTime = performance.now();
      const response = await fetch(...args);
      const url = new URL(args[0].toString());
      logger.since(startTime).info(url.pathname);
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

type Expandable<T> = {
  retrieve: (
    id: string,
    params: { expand?: string[] },
  ) => Promise<Stripe.Response<T>>;
};

export async function expand<T extends { id?: string }>(
  resource: Expandable<T>,
  object: T | string,
  expand?: string[],
) {
  if (expand?.some((e) => typeof get(object, e) !== "object")) {
    if (typeof object !== "string" && object.id) {
      object = object.id;
    }
  }
  if (typeof object === "string") {
    return resource.retrieve(object, { expand });
  }
  return object;
}

function sameCurrency(a: string, b: string) {
  return a.toLowerCase() === b.toLowerCase();
}

function getObjectId(object: string | { id: string }) {
  return typeof object === "string" ? object : object.id;
}

export interface CreatePlusPriceIfNeededParams {
  context: APIContext;
  productType: PlusType;
  currency: string;
  unitAmount: number;
  countryCode?: string;
}

export async function createPlusPriceIfNeeded({
  context,
  productType,
  currency,
  unitAmount,
  countryCode,
}: CreatePlusPriceIfNeededParams) {
  if (!stripe) return null;
  currency = currency.toLowerCase();
  const key = getPlusPriceKey({ product: productType, currency, countryCode });
  const prices = await stripe.prices.list({
    limit: 1,
    active: true,
    type: "one_time",
    lookup_keys: [key],
  });
  const price = prices.data[0];
  if (price) {
    return price;
  }
  const product = await createPlusProductIfNeeded({ context, productType });
  if (!product) return null;
  const nextPrice = await stripe.prices.create(
    {
      currency,
      unit_amount: unitAmount,
      product: product.id,
      lookup_key: key,
      transfer_lookup_key: true,
      tax_behavior: "exclusive",
    },
    { idempotencyKey: key },
  );
  return nextPrice;
}

export interface CreatePlusProductIfNeededParams {
  context: APIContext;
  productType: PlusType;
}

export async function createPlusProductIfNeeded({
  context,
  productType,
}: CreatePlusProductIfNeededParams) {
  if (context.locals.products?.[productType]) {
    return context.locals.products[productType];
  }
  if (!stripe) return null;
  for await (const product of stripe.products.list({
    active: true,
    limit: 100,
  })) {
    if (product.deleted) continue;
    if (product.metadata.plusType !== productType) continue;
    return product;
  }
  const names = {
    personal: "Ariakit Plus",
    team: "Ariakit Plus Team",
  };
  const product = await stripe.products.create(
    { name: names[productType], metadata: { productType } },
    { idempotencyKey: productType },
  );
  if (!context.locals.products) {
    context.locals.products = { personal: null, team: null };
  }
  context.locals.products[productType] = product;
  return product;
}
export async function createCustomerWithClerkUser(
  context: APIContext,
  user: User,
  params?: Stripe.CustomerCreateParams,
) {
  if (!stripe) return;
  params = {
    email: user.primaryEmailAddress?.emailAddress,
    ...params,
    metadata: { ...params?.metadata, clerkId: user.id },
  };
  const customer = await stripe.customers.create(params, {
    idempotencyKey: user.id,
  });
  await updateUserPrivateMetadata(context, user.id, { stripeId: customer.id });
  return customer;
}

export async function getPlusProducts() {
  const products: Record<PlusType, string | null> = {
    personal: null,
    team: null,
  };
  if (!stripe) return products;
  const personalKey = getPlusPriceKey({ product: "personal", currency: "USD" });
  const teamKey = getPlusPriceKey({ product: "team", currency: "USD" });
  const prices = await stripe.prices.list({
    type: "one_time",
    active: true,
    lookup_keys: [personalKey, teamKey],
  });
  const personal = prices.data.find((p) => p.lookup_key === personalKey);
  const team = prices.data.find((p) => p.lookup_key === teamKey);
  products.personal = personal ? getObjectId(personal.product) : null;
  products.team = team ? getObjectId(team.product) : null;
  return products;
}

export interface GetActivePlusPriceParams {
  context: APIContext;
  customer?: string | null;
}

export interface ActivePlusPrice {
  type: "personal" | "team";
  id: string;
  product: string;
  credit: number;
  currency: string;
}

export async function getActivePlusPrice({
  context,
  customer,
}: GetActivePlusPriceParams) {
  if (!stripe) return;
  if (!customer) {
    customer = await getCurrentCustomer(context);
    if (!customer) return;
  }
  const { personal, team } = await getPlusProducts();
  for await (const invoice of stripe.invoices.list({
    customer,
    limit: 100,
    status: "paid",
    expand: ["data.payments"],
  })) {
    const line = findInOrder(
      invoice.lines.data,
      (line) => line.pricing?.price_details?.product,
      [team, personal],
    );
    if (!line) continue;
    const price = line.pricing?.price_details?.price;
    const product = line.pricing?.price_details?.product;
    if (!price || !product) continue;
    const type = product === team ? "team" : "personal";
    const activePlusPrice = {
      type,
      id: price,
      product,
      credit: 0,
      currency: line.currency,
    } satisfies ActivePlusPrice;
    const payments = invoice.payments?.data;
    if (!payments?.length) return activePlusPrice;
    // Check if the payment is not refunded
    const paymentIntents = await Promise.all(
      payments.map((invoicePayment) => {
        const pi = invoicePayment.payment.payment_intent;
        if (!pi) return;
        if (typeof pi === "object") return pi;
        return stripe.paymentIntents.retrieve(pi, {
          expand: ["latest_charge"],
        });
      }),
    );
    const refunded = !paymentIntents.some((pi) => {
      if (!pi?.latest_charge) return false;
      invariant(typeof pi.latest_charge === "object");
      return !pi.latest_charge.refunded;
    });
    if (refunded) continue;
    if (type === "personal") {
      // Add credits
      const amountRefunded = paymentIntents.reduce((acc, pi) => {
        if (!pi?.latest_charge) return acc;
        invariant(typeof pi.latest_charge === "object");
        return acc + pi.latest_charge.amount_refunded;
      }, 0);
      activePlusPrice.credit = payments.reduce((acc, payment) => {
        return acc + (payment.amount_paid ?? 0) - amountRefunded;
      }, 0);
    }
    return activePlusPrice;
  }
  return null;
}

interface GetDiscountParams {
  product?: string | null;
  customer?: string | null;
  discounts?: Discount[];
  promotionCode?: string;
}

export async function getDiscount({
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
      stripe.promotionCodes.list({ customer, active: true, limit: 100 }),
    );
  }

  if (promotionCode) {
    promises.push(
      stripe.promotionCodes.list({ active: true, code: promotionCode }),
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

  return highestDiscount;
}

export interface CreateCheckoutParams {
  price: Stripe.Price | string;
  customer: string;
  redirectUrl: string | URL;
  amount?: number | null;
  discount?: Discount | null;
}

export async function createCheckout({
  price,
  customer,
  redirectUrl,
  amount,
  discount,
}: CreateCheckoutParams) {
  if (!stripe) return;
  price = await expand(stripe.prices, price);
  const product = getObjectId(price.product);

  const url = new URL(redirectUrl);
  const returnUrl = new URL("/plus/success", url.origin);
  returnUrl.searchParams.set("session_id", "_CHECKOUT_SESSION_ID_");
  returnUrl.searchParams.set("redirect_url", url.toString());

  const lineItem: Stripe.Checkout.SessionCreateParams.LineItem =
    !amount || price.unit_amount === amount
      ? {
          price: price.id,
          quantity: 1,
        }
      : {
          price_data: {
            product,
            unit_amount: amount,
            currency: price.currency,
            tax_behavior: price.tax_behavior ?? "exclusive",
          },
          quantity: 1,
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
    return_url: returnUrl
      .toString()
      .replace("_CHECKOUT_SESSION_ID_", "{CHECKOUT_SESSION_ID}"),
    payment_intent_data: {
      metadata: {
        price: price.id,
        product,
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

export interface PlusPrice {
  id: string;
  price: Stripe.Price;
  currency: string;
  amount: number;
  product: string;
  percentOff: number;
  originalAmount: number;
  expiresAt: number | null;
  discount: Discount | null;
}

export interface GetPlusPriceParams {
  context: APIContext;
  customer?: string | null;
  product?: "personal" | "team";
  getActivePlusPrice?: typeof getActivePlusPrice;
  currency?: string;
  countryCode?: string;
  promotionCode?: string;
}

function getPlusPriceKey({
  product = "personal",
  currency = "USD",
  countryCode,
}: Pick<GetPlusPriceParams, "product" | "currency" | "countryCode">) {
  const isPersonal = product === "personal";
  const lowercaseCurrency = currency.toLowerCase();
  const country = countryCode ? `-${countryCode.toLowerCase()}` : "";
  return isPersonal
    ? `ariakit-plus-${lowercaseCurrency}${country}`
    : `ariakit-plus-team-${lowercaseCurrency}${country}`;
}

export async function getPlusPrice({
  context,
  product = "personal",
  currency = "USD",
  customer,
  countryCode,
  promotionCode,
  getActivePlusPrice,
}: GetPlusPriceParams) {
  if (!stripe) return null;
  if (!customer) {
    customer = await getCurrentCustomer(context);
  }

  const activePlusPrice =
    product === "team" && getActivePlusPrice
      ? await getActivePlusPrice({ context, customer })
      : null;

  const credit =
    activePlusPrice?.credit && sameCurrency(currency, activePlusPrice.currency)
      ? activePlusPrice.credit
      : null;

  const keys = [
    getPlusPriceKey({ product, currency, countryCode }),
    getPlusPriceKey({ product, currency }),
    getPlusPriceKey({ product, currency: "USD" }),
  ];
  const response = await stripe.prices.list({
    active: true,
    type: "one_time",
    lookup_keys: keys,
  });
  const prices = response.data;
  if (!prices.length) return null;

  const price = findInOrder(prices, "lookup_key", keys);
  if (!price) return null;
  return createPlusPrice({ price, credit, customer, promotionCode });
}

interface CreatePlusPriceParams {
  price: Stripe.Price;
  credit?: number | null;
  customer?: string | null;
  promotionCode?: string;
}

async function createPlusPrice({
  price,
  credit,
  customer,
  promotionCode,
}: CreatePlusPriceParams) {
  if (!price.unit_amount) return null;
  const originalAmount = price.unit_amount - (credit ?? 0);

  const product = getObjectId(price.product);
  const discount = await getDiscount({
    product,
    customer,
    promotionCode,
  });

  const expiresAt = getDiscountExpirationDateMs(discount);
  const amount = applyDiscount(originalAmount, getDiscountCoupon(discount));
  const percentOff = getPercentOff(originalAmount, amount);

  return {
    id: price.id,
    price,
    product,
    currency: price.currency,
    originalAmount,
    amount,
    percentOff,
    expiresAt,
    discount: discount ?? null,
  } satisfies PlusPrice;
}

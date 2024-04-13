import { differenceInMonths } from "date-fns/differenceInMonths";
import get from "lodash-es/get.js";
import { Stripe } from "stripe";
import invariant from "tiny-invariant";
import {
  getCurrentUser,
  getPrimaryEmailAddress,
  getStripeId,
  updateUserWithStripeId,
} from "./clerk.ts";
import type { User, UserResource } from "./clerk.ts";

type Discount = Stripe.Coupon | Stripe.PromotionCode;

const PLUS_MONTHLY = "ariakit-plus-monthly";
const PLUS_YEARLY = "ariakit-plus-yearly";
const PLUS_ONE_TIME = "ariakit-plus-one-time";
const PLUS_PRICES = [PLUS_MONTHLY, PLUS_YEARLY, PLUS_ONE_TIME];

const key = process.env.STRIPE_SECRET_KEY;
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

function isPlusPrice(price: Stripe.Price) {
  return !!price.lookup_key && PLUS_PRICES.includes(price.lookup_key);
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
  user?: User | UserResource | null,
  params?: Stripe.CustomerCreateParams,
) {
  if (!stripe) return;
  if (!user) {
    throw new Error("User is required");
  }
  const email = getPrimaryEmailAddress(user);
  params = {
    email,
    ...params,
    metadata: { ...params?.metadata, clerkId: user.id },
  };
  const customer = await stripe.customers.create(params, {
    idempotencyKey: user.id,
  });
  await updateUserWithStripeId(user.id, customer.id);
  return customer;
}

export async function listActiveSubscriptions(customerId?: string) {
  if (!stripe) return;
  if (!customerId) return [];
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "active",
  });
  return subscriptions.data;
}

export function getSubscriptionsPrices(subscriptions?: Stripe.Subscription[]) {
  if (!subscriptions?.length) return [];
  return subscriptions.flatMap((s) => s.items.data.map((i) => i.price));
}

export function filterPlusSubscriptions(subscriptions?: Stripe.Subscription[]) {
  if (!subscriptions?.length) return [];
  return subscriptions.filter((s) =>
    s.items.data.some((i) => isPlusPrice(i.price)),
  );
}

export function findSubscriptionPlusPrice(
  subscriptions?: Stripe.Subscription[],
) {
  if (!subscriptions?.length) return;
  const plusSubscription = filterPlusSubscriptions(subscriptions);
  if (!plusSubscription.length) return;
  const plusPrices = getSubscriptionsPrices(plusSubscription);
  if (!plusPrices.length) return;
  return plusPrices[0];
}

export async function cancelSubscription(
  subscription: Stripe.Subscription | string,
) {
  if (!stripe) return;
  return stripe.subscriptions.cancel(getObjectId(subscription), {
    prorate: false,
  });
}

export async function listPlusPrices(type?: "one_time" | "recurring") {
  if (!stripe) return;
  const prices = await stripe.prices.list({
    type,
    active: true,
    lookup_keys: PLUS_PRICES,
    expand: ["data.product"],
  });
  return prices.data;
}

export async function getPlusProduct(plusPrices?: Stripe.Price[]) {
  if (!stripe) return;

  plusPrices = plusPrices || (await listPlusPrices("one_time"));
  const price = plusPrices?.at(0);
  invariant(price, "Price not found");

  return expand(stripe.products, price.product);
}

export async function getActivePlusPrice(customer?: string) {
  if (!stripe) return;
  if (!customer) return;

  const plusPrices = await listPlusPrices();
  invariant(plusPrices, "Prices not found");

  const product = await getPlusProduct(plusPrices);
  invariant(product, "Product not found");

  for await (const invoice of stripe.invoices.list({
    customer,
    expand: ["data.charge"],
    status: "paid",
    limit: 100,
  })) {
    if (invoice.charge && typeof invoice.charge === "object") {
      if (!invoice.charge.paid) continue;
      if (invoice.charge.refunded) continue;
    }
    for (const line of invoice.lines.data) {
      if (!line.price?.product) continue;
      if (line.price?.type !== "one_time") continue;
      if (line.price.product !== product.id) continue;
      const price = line.price;
      return Object.assign(price, { product });
    }
  }

  for await (const charge of stripe.charges.list({
    customer,
    expand: ["data.payment_intent"],
    limit: 100,
  })) {
    if (charge.refunded) continue;
    if (!charge.paid) continue;
    if (!charge.payment_intent) continue;
    if (typeof charge.payment_intent !== "object") continue;
    const priceId = charge.payment_intent.metadata.price;
    if (!priceId) continue;
    const priceProduct = charge.payment_intent.metadata.product;
    if (priceProduct !== product.id) continue;
    const price = await stripe.prices.retrieve(priceId);
    if (!price) continue;
    return Object.assign(price, { product });
  }

  return;
}

interface GetDiscountParams {
  amount?: number | null;
  product?: string;
  customer?: string;
  discount?: Discount;
}

export async function getDiscount({
  amount,
  product,
  customer,
  discount: discountParam,
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
    discountParam ? [...codes, discountParam] : codes,
  );

  if (!customer) return highestDiscount;
  if (!amount) return highestDiscount;

  const subscription = filterPlusSubscriptions(
    await listActiveSubscriptions(customer),
  ).at(0);
  if (!subscription) return highestDiscount;

  const price = findSubscriptionPlusPrice([subscription]);
  if (!price?.unit_amount) return highestDiscount;

  const coupon = getDiscountCoupon(highestDiscount);
  const months = differenceInMonths(new Date(), subscription.start_date * 1000);
  const amountOff =
    price.recurring?.interval === "month"
      ? price.unit_amount * clamp(months + 1, 1, 3)
      : price.unit_amount;

  const finalAmount = applyDiscount(amount, {
    percent_off: coupon?.percent_off || null,
    amount_off: amountOff,
  });

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

  if (discount) return Object.assign(discount, { redeem_by: redeemBy });

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
  customer?: string;
  redirectUrl: string | URL;
  promotionCode?: string;
}

export async function createCheckout({
  price,
  customer,
  redirectUrl,
  promotionCode,
}: CreateCheckoutParams) {
  if (!stripe) return;
  const user = await getCurrentUser();
  customer = customer ?? getStripeId(user);

  if (!customer) {
    const object = await createCustomerWithClerkUser(user);
    if (!object) throw new Error("No customer");
    customer = object.id;
  }

  price = await expand(stripe.prices, price);

  for await (const session of stripe.checkout.sessions.list({
    customer,
    limit: 100,
    expand: ["data.payment_intent"],
  })) {
    if (session.status !== "complete") continue;
    if (!session.payment_intent) continue;
    if (typeof session.payment_intent !== "object") continue;
    if (session.payment_intent.metadata.price !== price.id) continue;
    return session;
  }

  let externalDiscount: Discount | undefined;

  if (promotionCode) {
    const code = await stripe.promotionCodes.list({
      active: true,
      code: promotionCode,
    });
    externalDiscount = code.data.find(
      (c) => !c.customer || c.customer === customer,
    );
  }

  const discount = await getDiscount({
    customer,
    amount: price.unit_amount,
    product: getObjectId(price.product),
    discount: externalDiscount,
  });

  const url = new URL(redirectUrl);
  const returnUrl = new URL("/api/checkout-success", url.origin);
  returnUrl.searchParams.set("session_id", "_CHECKOUT_SESSION_ID_");
  returnUrl.searchParams.set("redirect_url", url.toString());

  const session = await stripe.checkout.sessions.create({
    customer,
    line_items: [{ price: price.id, quantity: 1 }],
    mode: "payment",
    ui_mode: "embedded",
    invoice_creation: { enabled: true },
    redirect_on_completion: "if_required",
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

export interface PlusPrice {
  id: string;
  currency: string;
  amount: number;
  product: string;
  percentOff: number;
  originalAmount: number;
  expiresAt: number | null;
}

export async function getPlusPrice(customer?: string) {
  if (!stripe) return;
  customer = customer ?? getStripeId(await getCurrentUser());

  const prices = await listPlusPrices("one_time");
  if (!prices) return;
  const price = prices.find((price) => price.lookup_key === PLUS_ONE_TIME);
  if (!price) return null;
  if (!price.unit_amount) return null;
  if (!price) return null;
  if (!price.unit_amount) return null;

  const productId = getObjectId(price.product);
  const discount = await getDiscount({
    product: productId,
    amount: price.unit_amount,
    customer: customer,
  });
  const expiresAt = getDiscountExpirationDateMs(discount);
  const amount = applyDiscount(price.unit_amount, getDiscountCoupon(discount));
  const percentOff = getPercentOff(price.unit_amount, amount);

  return {
    id: price.id,
    product: productId,
    currency: price.currency,
    originalAmount: price.unit_amount,
    amount,
    percentOff,
    expiresAt,
  } satisfies PlusPrice;
}

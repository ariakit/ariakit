import { Stripe } from "stripe";
import {
  getCurrentUser,
  getPrimaryEmailAddress,
  getStripeId,
  updateUserWithStripeId,
} from "./clerk.js";
import type { User, UserResource } from "./clerk.js";

const PLUS_MONTHLY = "ariakit-plus-monthly";
const PLUS_YEARLY = "ariakit-plus-yearly";
const PLUS_ONE_TIME = "ariakit-plus-one-time";
const PLUS_PRICES = [PLUS_MONTHLY, PLUS_YEARLY, PLUS_ONE_TIME];
const COUPON_10 = "discount-10";
const COUPON_20 = "discount-20";
const COUPON_30 = "discount-30";
const COUPON_50 = "discount-50";
const promotionCoupons = [COUPON_10, COUPON_20, COUPON_30, COUPON_50];

const key = process.env.STRIPE_SECRET_KEY;
const stripe = key ? new Stripe(key) : null;

function getDiscountCoupon(
  discount: Stripe.Coupon | Stripe.PromotionCode,
): Stripe.Coupon;

function getDiscountCoupon(
  discount?: Stripe.Coupon | Stripe.PromotionCode,
): Stripe.Coupon | undefined;

function getDiscountCoupon(discount?: Stripe.Coupon | Stripe.PromotionCode) {
  if (!discount) return;
  if (discount.object === "coupon") return discount;
  return discount.coupon;
}

function getDiscountExpiration(
  discount?: Stripe.Coupon | Stripe.PromotionCode,
) {
  if (!discount) return null;
  const date =
    discount.object === "promotion_code"
      ? discount.expires_at
      : discount.redeem_by;
  if (!date) return null;
  return date * 1000;
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

function getPercentOff(originalAmount: number, amount: number) {
  const percentOff = Math.round(
    ((originalAmount - amount) / originalAmount) * 100,
  );
  return Math.max(Math.min(percentOff, 100), 0);
}

function isPlusPrice(price: Stripe.Price) {
  return !!price.lookup_key && PLUS_PRICES.includes(price.lookup_key);
}

export function getStripeClient() {
  return stripe;
}

export function getClerkIdFromCustomer(
  customer: Stripe.Customer | Stripe.DeletedCustomer,
) {
  if (!stripe) return;
  if (customer.deleted) return;
  return customer.metadata.clerkId;
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

export async function cancelSubscription(subscriptionId: string) {
  if (!stripe) return;
  const canceledSubscription = await stripe.subscriptions.cancel(
    subscriptionId,
    { prorate: false },
  );
  return canceledSubscription;
}

export async function listPlusPrices(type?: "one_time" | "recurring") {
  if (!stripe) return;
  const prices = await stripe.prices.list({
    type,
    limit: 100,
    active: true,
    lookup_keys: PLUS_PRICES,
  });
  return prices.data;
}

export async function getDefaultPrice(productId?: string) {
  if (!stripe) return;
  if (!productId) return;
  const expand = ["default_price"];
  const product = await stripe.products.retrieve(productId, { expand });
  const defaultPrice = product.default_price;
  if (!defaultPrice) return;
  if (typeof defaultPrice !== "object") return;
  return defaultPrice;
}

export async function getPurchasedPlusPrice(customerId?: string) {
  if (!stripe) return;
  if (!customerId) return;
  const plusPrices = await listPlusPrices("one_time");

  for await (const invoice of stripe.invoices.list({
    customer: customerId,
    expand: ["data.charge"],
    status: "paid",
    limit: 100,
  })) {
    if (invoice.charge && typeof invoice.charge === "object") {
      if (!invoice.charge.paid) continue;
      if (invoice.charge.refunded) continue;
    }
    for (const line of invoice.lines.data) {
      if (!line.price?.id) continue;
      if (line.price?.type !== "one_time") continue;
      const plusPrice = plusPrices?.find((p) => p.id === line.price?.id);
      if (!plusPrice) continue;
      return plusPrice;
    }
  }

  for await (const charge of stripe.charges.list({
    customer: customerId,
    expand: ["data.payment_intent"],
    limit: 100,
  })) {
    if (charge.refunded) continue;
    if (!charge.paid) continue;
    if (!charge.payment_intent) continue;
    if (typeof charge.payment_intent !== "object") continue;
    const priceId = charge.payment_intent.metadata.price;
    if (!priceId) continue;
    const plusPrice = plusPrices?.find((p) => p.id === priceId);
    if (!plusPrice) continue;
    return plusPrice;
  }

  return;
}

export function filterPlusPrices(prices?: Stripe.Price[]) {
  if (!prices?.length) return [];
  return prices.filter(isPlusPrice);
}

export async function getCustomerPlusPrice(
  customerId?: string,
  activeSubscriptions?: Stripe.Subscription[],
) {
  if (!stripe) return;
  const customer = customerId ?? getStripeId(await getCurrentUser());
  if (!customer) return;
  const price = await getPurchasedPlusPrice(customer);
  if (price) return price;

  return findSubscriptionPlusPrice(
    activeSubscriptions || (await listActiveSubscriptions(customer)),
  );
}

function getHighestDiscount(
  discounts?: Array<Stripe.Coupon | Stripe.PromotionCode>,
) {
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

interface GetDiscountParams {
  amount?: number | null;
  customerId?: string;
  productId?: string;
}

export async function getDiscount({
  amount,
  customerId,
  productId,
}: GetDiscountParams) {
  if (!stripe) return;
  const promises: Stripe.ApiListPromise<Stripe.PromotionCode>[] = [];
  const coupons: Stripe.Coupon[] = [];

  for await (const coupon of stripe.coupons.list({ limit: 100 })) {
    if (coupon.deleted) continue;
    if (!coupon.valid) continue;
    if (productId) {
      if (coupon.applies_to?.products.length) {
        if (!coupon.applies_to.products.includes(productId)) continue;
      }
    }
    coupons.push(coupon);
    if (!promotionCoupons.includes(coupon.id)) continue;
    promises.push(
      stripe.promotionCodes.list({
        active: true,
        coupon: coupon.id,
        limit: 100,
      }),
    );
  }

  const codes = (await Promise.all(promises)).flatMap((c) => c.data);
  const highestDiscount = getHighestDiscount(codes);

  if (!customerId) return highestDiscount;
  if (!amount) return highestDiscount;

  const subscriptions = await listActiveSubscriptions(customerId);
  const price = findSubscriptionPlusPrice(subscriptions);
  if (!price?.unit_amount) return highestDiscount;

  const coupon = getDiscountCoupon(highestDiscount);

  const finalAmount = applyDiscount(amount, {
    percent_off: coupon?.percent_off || null,
    amount_off: price.unit_amount,
  });

  const percentOff = getPercentOff(amount, finalAmount);
  const discount = coupons.find((coupon) => coupon.percent_off === percentOff);
  if (discount) return discount;

  const couponId = `discount-${percentOff}`;

  const nextCoupon = await stripe.coupons.create(
    {
      id: couponId,
      name: `${percentOff}% off`,
      percent_off: percentOff,
      duration: "once",
      applies_to: productId ? { products: [productId] } : {},
      metadata: { auto_generated: "true" },
    },
    { idempotencyKey: couponId },
  );

  return nextCoupon;
}

export interface CreateCheckoutParams {
  priceId: string;
  redirectUrl: string | URL;
  customerId?: string;
}

export async function createCheckout({
  priceId,
  redirectUrl,
  customerId,
}: CreateCheckoutParams) {
  if (!stripe) return;

  const user = await getCurrentUser();

  let customer = customerId ?? getStripeId(user);

  if (!customer) {
    const object = await createCustomerWithClerkUser(user);
    if (!object) throw new Error("No customer");
    customer = object.id;
  }

  const price = await stripe.prices.retrieve(priceId);

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

  const discount = await getDiscount({
    amount: price.unit_amount,
    customerId: customer,
    productId: price.product.toString(),
  });

  const url = new URL(redirectUrl);
  const returnUrl = new URL("/api/checkout-success", url.origin);
  returnUrl.searchParams.set("session_id", "_CHECKOUT_SESSION_ID_");
  returnUrl.searchParams.set("redirect_url", url.toString());

  // TODO: Try creating one-off coupons after testing.
  const session = await stripe.checkout.sessions.create({
    customer,
    line_items: [{ price: price.id, quantity: 1 }],
    mode: "payment",
    ui_mode: "embedded",
    invoice_creation: { enabled: true },
    return_url: returnUrl
      .toString()
      .replace("_CHECKOUT_SESSION_ID_", "{CHECKOUT_SESSION_ID}"),
    redirect_on_completion: "if_required",
    discounts: discount
      ? [
          discount.object === "coupon"
            ? { coupon: discount.id }
            : { promotion_code: discount.id },
        ]
      : [],
    payment_intent_data: { metadata: { price: price.id } },
  });

  return session;
}

export async function getCheckout(sessionId: string) {
  if (!stripe) return;
  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    return session;
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

export async function getPlusPrice(customerId?: string) {
  if (!stripe) return;
  const customer = customerId ?? getStripeId(await getCurrentUser());

  const prices = await listPlusPrices("one_time");
  if (!prices) return;
  const price = prices.find((price) => price.lookup_key === PLUS_ONE_TIME);
  if (!price) return null;
  if (!price.unit_amount) return null;
  if (!price) return null;
  if (!price.unit_amount) return null;

  const productId = price.product.toString();
  const discount = await getDiscount({
    amount: price.unit_amount,
    customerId: customer,
    productId,
  });
  const expiresAt = getDiscountExpiration(discount);
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

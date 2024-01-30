import { currentUser } from "@clerk/nextjs";
import { Stripe } from "stripe";
import { getStripeId } from "./clerk.js";

const PLUS_MONTHLY = "ariakit-plus-monthly";
const PLUS_YEARLY = "ariakit-plus-yearly";
const PLUS_ONE_TIME = "ariakit-plus-one-time";
const PLUS_ONE_TIME_MONTHLY = "ariakit-plus-one-time-monthly";
const PLUS_ONE_TIME_YEARLY = "ariakit-plus-one-time-yearly";
const PLUS_PRICES = [
  PLUS_MONTHLY,
  PLUS_YEARLY,
  PLUS_ONE_TIME,
  PLUS_ONE_TIME_MONTHLY,
  PLUS_ONE_TIME_YEARLY,
];
const COUPON_10 = "discount-10";
const COUPON_20 = "discount-20";
const COUPON_30 = "discount-30";
const COUPON_50 = "discount-50";
const promotionCoupons = [COUPON_10, COUPON_20, COUPON_30, COUPON_50];

const key = process.env.STRIPE_SECRET_KEY;
const stripe = key ? new Stripe(key) : null;

function applyDiscount(
  value: number,
  discount?: Pick<Stripe.Coupon, "amount_off" | "percent_off">,
) {
  if (!discount) return value;
  const amount = discount.amount_off ?? 0;
  const percent = discount.percent_off ?? 0;
  return value - amount - value * (percent / 100);
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

export async function createCustomerWithClerkId(
  clerkId: string,
  params?: Stripe.CustomerCreateParams,
) {
  if (!stripe) return;
  const customer = await stripe.customers.create(
    { ...params, metadata: { ...params?.metadata, clerkId } },
    { idempotencyKey: clerkId },
  );
  return customer;
}

export async function updateCustomerWithClerkId(
  customerId: string,
  clerkId: string,
) {
  if (!stripe) return;
  const customer = await stripe.customers.update(customerId, {
    metadata: { clerkId },
  });
  return customer;
}

export async function getActiveSubscriptions(customerId?: string) {
  if (!stripe) return;
  if (!customerId) return [];
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "active",
    limit: 100,
  });
  return subscriptions.data;
}

export function hasSubscription(
  subscriptions?: Stripe.Subscription[],
  lookupKeys?: string[],
) {
  if (!subscriptions?.length) return false;
  if (!lookupKeys?.length) return true;
  return subscriptions.some((s) =>
    s.items.data.some(
      (i) => i.price.lookup_key && lookupKeys.includes(i.price.lookup_key),
    ),
  );
}

export function getSubscriptionsPrices(subscriptions?: Stripe.Subscription[]) {
  if (!subscriptions?.length) return [];
  return subscriptions.flatMap((s) => s.items.data.map((i) => i.price));
}

export function getPlusSubscriptions(subscriptions?: Stripe.Subscription[]) {
  if (!subscriptions?.length) return [];
  return subscriptions.filter((s) =>
    s.items.data.some((i) => isPlusPrice(i.price)),
  );
}

export async function cancelSubscription(subscriptionId: string) {
  if (!stripe) return;
  const canceledSubscription = await stripe.subscriptions.cancel(
    subscriptionId,
    { prorate: false },
  );
  return canceledSubscription;
}

export async function getDefaultPrice(productId?: string) {
  if (!stripe) return;
  if (!productId) return;
  const product = await stripe.products.retrieve(productId);
  const defaultPriceId = product.default_price?.toString();
  if (!defaultPriceId) return;
  const price = await stripe.prices.retrieve(defaultPriceId);
  return price;
}

export async function getPurchasedPrices(customerId?: string) {
  if (!stripe) return;
  if (!customerId) return [];
  const invoices = await stripe.invoices.list({
    customer: customerId,
    status: "paid",
    limit: 100,
  });
  const priceIds = new Set<string>();
  const prices: Stripe.Price[] = [];
  for (const invoice of invoices.data) {
    for (const line of invoice.lines.data) {
      if (line.price?.type !== "one_time") continue;
      if (priceIds.has(line.price.id)) continue;
      priceIds.add(line.price.id);
      prices.push(line.price);
    }
  }
  return prices;
}

export function getPlusPrices(prices?: Stripe.Price[]) {
  if (!prices?.length) return [];
  return prices.filter(isPlusPrice);
}

export interface IsPlusCustomerParams {
  customerId?: string;
  purchasedPrices?: Stripe.Price[];
  activeSubscriptions?: Stripe.Subscription[];
}

export async function isPlusCustomer({
  customerId,
  purchasedPrices,
  activeSubscriptions,
}: IsPlusCustomerParams) {
  const prices = purchasedPrices || (await getPurchasedPrices(customerId));
  const plusPrices = getPlusPrices(prices);
  if (plusPrices.length) {
    const price = plusPrices[0];
    const oneTimeConvertPrices = [PLUS_ONE_TIME_MONTHLY, PLUS_ONE_TIME_YEARLY];
    if (price?.lookup_key && oneTimeConvertPrices.includes(price.lookup_key)) {
      return getDefaultPrice(plusPrices[0]?.product.toString());
    }
    return price;
  }
  const subscriptions = getPlusSubscriptions(
    activeSubscriptions || (await getActiveSubscriptions(customerId)),
  );
  const subscriptionsPrices = getSubscriptionsPrices(subscriptions);
  const subscriptionsPlusPrices = getPlusPrices(subscriptionsPrices);
  if (subscriptionsPlusPrices.length) {
    return subscriptionsPlusPrices[0];
  }
  return;
}

export async function getDiscount(productId?: string) {
  if (!stripe) return;
  const coupons = await stripe.coupons.list({ limit: 100 });

  const promises = coupons.data
    .filter((coupon) => {
      if (coupon.deleted) return false;
      if (!coupon.valid) return false;
      if (productId) {
        if (coupon.applies_to?.products.length) {
          if (!coupon.applies_to.products.includes(productId)) return false;
        }
      }
      if (!promotionCoupons.includes(coupon.id)) return false;
      return true;
    })
    .map((coupon) => {
      return stripe.promotionCodes.list({
        active: true,
        coupon: coupon.id,
        limit: 100,
      });
    });

  const codes = (await Promise.all(promises)).flatMap((c) => c.data);

  if (!codes.length) return;

  const highestDiscount = codes.reduce((highest, code) => {
    const percent = code.coupon?.percent_off ?? 0;
    if (!highest.coupon.percent_off) return code;
    if (percent > highest.coupon.percent_off) return code;
    return highest;
  });

  return highestDiscount;
}

export async function getPlusCustomerByEmailWithoutClerkId(email: string) {
  if (!stripe) return;
  const customers = await stripe.customers.list({
    email,
    expand: ["data.subscriptions"],
  });

  for (const customer of customers.data) {
    if (customer.deleted) continue;
    if (customer.metadata.clerkId) continue;
    const activeSubscriptions = customer.subscriptions?.data.filter(
      (s) => s.status === "active",
    );
    const hasPlus = await isPlusCustomer({
      customerId: customer.id,
      activeSubscriptions,
    });
    if (!hasPlus) continue;
    return customer;
  }

  return;
}

export async function getCustomer(customerId: string) {
  if (!stripe) return;
  const customer = await stripe.customers.retrieve(customerId);
  if (customer.deleted) return;
  return customer;
}

export interface CreateCheckoutParams {
  priceId: string;
  returnUrl: string;
  customerId?: string;
  mode?: "subscription" | "payment";
}

export async function createCheckout({
  priceId,
  returnUrl,
  customerId,
  mode = "subscription",
}: CreateCheckoutParams) {
  if (!stripe) return;

  const url = new URL(returnUrl);
  const customer = customerId ?? getStripeId(await currentUser());
  const pathname = "/sign-up";

  const activeSubscriptions = customer
    ? await getActiveSubscriptions(customer)
    : [];

  const price = await stripe.prices.retrieve(priceId);
  const isMonthly = price.lookup_key === PLUS_ONE_TIME_MONTHLY;
  const isYearly = price.lookup_key === PLUS_ONE_TIME_YEARLY;

  if (isMonthly && !hasSubscription(activeSubscriptions, [PLUS_MONTHLY])) {
    throw new Error("No monthly subscription found");
  }
  if (isYearly && !hasSubscription(activeSubscriptions, [PLUS_YEARLY])) {
    throw new Error("No yearly subscription found");
  }

  const discount = await getDiscount(price.product.toString());

  const session = await stripe.checkout.sessions.create({
    mode,
    customer,
    line_items: [{ price: priceId, quantity: 1 }],
    ui_mode: "embedded",
    invoice_creation: { enabled: true },
    return_url: `${url.origin}${pathname}?session-id={CHECKOUT_SESSION_ID}`,
    discounts: discount ? [{ promotion_code: discount.id }] : [],
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

export async function refundCheckout(sessionId: string) {
  if (!stripe) return;

  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (!session.payment_intent) return;
  if (session.payment_status !== "paid") return;

  const refund = await stripe.refunds.create({
    payment_intent: session.payment_intent.toString(),
  });

  return refund;
}

export function getPlusPriceFromSession(session: Stripe.Checkout.Session) {
  if (!session.line_items?.data.length) return;
  const items = session.line_items.data;
  const item = items.find((i) => i.price && isPlusPrice(i.price));
  return item?.price || undefined;
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
  const customer = customerId ?? getStripeId(await currentUser());
  const activeSubscriptions = customer
    ? await getActiveSubscriptions(customer)
    : [];

  const monthly = hasSubscription(activeSubscriptions, [PLUS_MONTHLY]);
  const yearly = hasSubscription(activeSubscriptions, [PLUS_YEARLY]);

  const prices = await stripe.prices.list({
    active: true,
    lookup_keys: [
      PLUS_ONE_TIME,
      monthly
        ? PLUS_ONE_TIME_MONTHLY
        : yearly
          ? PLUS_ONE_TIME_YEARLY
          : PLUS_ONE_TIME,
    ],
  });
  const originalPrice = prices.data.find(
    (price) => price.lookup_key === PLUS_ONE_TIME,
  );
  const price =
    prices.data.find((price) => price !== originalPrice) || originalPrice;
  if (!originalPrice) return null;
  if (!originalPrice.unit_amount) return null;
  if (!price) return null;
  if (!price.unit_amount) return null;

  const productId = price.product.toString();
  const discount = await getDiscount(productId);
  const expiresAt = discount?.expires_at ? discount.expires_at * 1000 : null;
  const originalAmount = originalPrice.unit_amount;
  const amount = applyDiscount(price.unit_amount, discount?.coupon);
  const percentOff = Math.round(
    ((originalAmount - amount) / originalAmount) * 100,
  );

  return {
    id: price.id,
    product: productId,
    currency: price.currency,
    originalAmount: originalPrice.unit_amount,
    amount,
    percentOff,
    expiresAt,
  } satisfies PlusPrice;
}

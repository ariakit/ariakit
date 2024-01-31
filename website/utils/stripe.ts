import { currentUser } from "@clerk/nextjs";
import { Stripe } from "stripe";
import {
  getPrimaryEmailAddress,
  getStripeId,
  updateUserWithStripeId,
} from "./clerk.js";

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

export async function listActiveSubscriptions(customerId?: string) {
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

export function filterPlusSubscriptions(subscriptions?: Stripe.Subscription[]) {
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

export async function listPurchasedPlusPrices(customerId?: string) {
  if (!stripe) return;
  if (!customerId) return [];
  const plusPrices = await listPlusPrices("one_time");

  const params = {
    customer: customerId,
    expand: ["data.payment_intent"],
    limit: 100,
  } satisfies Stripe.ChargeListParams;

  const priceIds = new Set<string>();
  const prices: Stripe.Price[] = [];

  for await (const charge of stripe.charges.list(params)) {
    if (charge.refunded) continue;
    if (!charge.payment_intent) continue;
    if (typeof charge.payment_intent !== "object") continue;
    const priceId = charge.payment_intent.metadata.price;
    if (!priceId) continue;
    if (priceIds.has(priceId)) continue;
    const plusPrice = plusPrices?.find((p) => p.id === priceId);
    if (!plusPrice) continue;
    priceIds.add(priceId);
    prices.push(plusPrice);
  }

  return prices;
}

export async function getPurchasedPlusPrice(customerId?: string) {
  if (!stripe) return;
  if (!customerId) return;
  const plusPrices = await listPlusPrices("one_time");

  const invoiceListParams = {
    customer: customerId,
    expand: ["data.charge"],
    status: "paid",
    limit: 100,
  } satisfies Stripe.InvoiceListParams;

  for await (const invoice of stripe.invoices.list(invoiceListParams)) {
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

  const chargeListParams = {
    customer: customerId,
    expand: ["data.payment_intent"],
    limit: 100,
  } satisfies Stripe.ChargeListParams;

  for await (const charge of stripe.charges.list(chargeListParams)) {
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
  const customer = customerId ?? getStripeId(await currentUser());
  if (!customer) return;
  const price = await getPurchasedPlusPrice(customer);
  if (price) {
    const oneTimeConvertPrices = [PLUS_ONE_TIME_MONTHLY, PLUS_ONE_TIME_YEARLY];
    if (price?.lookup_key && oneTimeConvertPrices.includes(price.lookup_key)) {
      return getDefaultPrice(price.product.toString());
    }
    return price;
  }
  const subscriptions = filterPlusSubscriptions(
    activeSubscriptions || (await listActiveSubscriptions(customerId)),
  );
  const subscriptionsPrices = getSubscriptionsPrices(subscriptions);
  const subscriptionsPlusPrices = filterPlusPrices(subscriptionsPrices);
  if (subscriptionsPlusPrices.length) {
    return subscriptionsPlusPrices[0];
  }
  return;
}

export async function getDiscount(productId?: string) {
  if (!stripe) return;
  const promises: Stripe.ApiListPromise<Stripe.PromotionCode>[] = [];

  for await (const coupon of stripe.coupons.list({ limit: 100 })) {
    if (coupon.deleted) continue;
    if (!coupon.valid) continue;
    if (productId) {
      if (coupon.applies_to?.products.length) {
        if (!coupon.applies_to.products.includes(productId)) continue;
      }
    }
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
  const customerListParams = {
    email,
    expand: ["data.subscriptions"],
    limit: 100,
  } satisfies Stripe.CustomerListParams;

  for await (const customer of stripe.customers.list(customerListParams)) {
    if (customer.deleted) continue;
    if (customer.metadata.clerkId) continue;
    const activeSubscriptions = customer.subscriptions?.data.filter(
      (s) => s.status === "active",
    );
    const hasPlus = await getCustomerPlusPrice(
      customer.id,
      activeSubscriptions,
    );
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
  redirectUrl: string | URL;
  customerId?: string;
}

export async function createCheckout({
  priceId,
  redirectUrl,
  customerId,
}: CreateCheckoutParams) {
  if (!stripe) return;

  const user = await currentUser();

  let customer = customerId ?? getStripeId(user);

  if (!customer) {
    if (!user) throw new Error("No user");
    const email = getPrimaryEmailAddress(user);
    const object = await createCustomerWithClerkId(user.id, { email });
    if (!object) throw new Error("No customer");
    await updateUserWithStripeId(user.id, object.id);
    customer = object.id;
  }

  let price: Stripe.Price = await stripe.prices.retrieve(priceId);
  const isMonthly = price.lookup_key === PLUS_ONE_TIME_MONTHLY;
  const isYearly = price.lookup_key === PLUS_ONE_TIME_YEARLY;

  const subscriptions = await listActiveSubscriptions(customer);
  const isMonthlySub = hasSubscription(subscriptions, [PLUS_MONTHLY]);
  const isYearlySub = hasSubscription(subscriptions, [PLUS_YEARLY]);

  if (isMonthly || isYearly) {
    if (isMonthly && !hasSubscription(subscriptions, [PLUS_MONTHLY])) {
      throw new Error("No monthly subscription found");
    }
    if (isYearly && !hasSubscription(subscriptions, [PLUS_YEARLY])) {
      throw new Error("No yearly subscription found");
    }
  } else if (isMonthlySub || isYearlySub) {
    const plusPrices = await listPlusPrices("one_time");
    const lookupKey = isMonthlySub
      ? PLUS_ONE_TIME_MONTHLY
      : PLUS_ONE_TIME_YEARLY;
    const plusPrice = plusPrices?.find((p) => p.lookup_key === lookupKey);
    if (!plusPrice) return;
    price = plusPrice;
  } else {
    const plusPrice = await getPurchasedPlusPrice(customer);
    if (plusPrice && plusPrice.product === price.product) {
      price = plusPrice;
    }
  }

  const sessionParams = {
    customer,
    limit: 100,
    expand: ["data.payment_intent"],
  } satisfies Stripe.Checkout.SessionListParams;

  for await (const session of stripe.checkout.sessions.list(sessionParams)) {
    if (session.status !== "complete") continue;
    if (!session.payment_intent) continue;
    if (typeof session.payment_intent !== "object") continue;
    if (session.payment_intent.metadata.price !== price.id) continue;
    return session;
  }

  const discount = await getDiscount(price.product.toString());

  const url = new URL(redirectUrl);
  const returnUrl = new URL("/api/checkout-success", url.origin);
  returnUrl.searchParams.set("session_id", "_CHECKOUT_SESSION_ID_");
  returnUrl.searchParams.set("redirect_url", url.toString());

  console.log(
    returnUrl
      .toString()
      .replace("_CHECKOUT_SESSION_ID_", "{CHECKOUT_SESSION_ID}"),
  );

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
    discounts: discount ? [{ promotion_code: discount.id }] : [],
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
  const customer = customerId ?? getStripeId(await currentUser());
  const activeSubscriptions = customer
    ? await listActiveSubscriptions(customer)
    : [];

  const monthly = hasSubscription(activeSubscriptions, [PLUS_MONTHLY]);
  const yearly = hasSubscription(activeSubscriptions, [PLUS_YEARLY]);
  const lookupKey = monthly
    ? PLUS_ONE_TIME_MONTHLY
    : yearly
      ? PLUS_ONE_TIME_YEARLY
      : PLUS_ONE_TIME;

  const prices = await listPlusPrices("one_time");
  if (!prices) return;
  const originalPrice = prices.find(
    (price) => price.lookup_key === PLUS_ONE_TIME,
  );
  const price =
    prices.find((price) => price.lookup_key === lookupKey) || originalPrice;
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

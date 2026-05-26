import { differenceInMonths } from "date-fns/differenceInMonths";
import get from "lodash-es/get.js";
import { Stripe } from "stripe";
import invariant from "tiny-invariant";
import type { User, UserResource } from "./clerk.ts";
import {
  getCurrentUser,
  getPrimaryEmailAddress,
  getStripeId,
  updateUserWithStripeId,
} from "./clerk.ts";

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

// NOTE: this function assumes any `PromotionCode` passed in was listed with
// `expand: ["data.promotion.coupon"]` (Stripe v19 moved the coupon under
// `promotion.coupon`). Without that expand, the nested coupon is a bare id and
// this returns `undefined`.
function getDiscountCoupon(discount?: Discount): Stripe.Coupon | undefined {
  if (!discount) return;
  if (discount.object === "coupon") return discount;
  const coupon = discount.promotion?.coupon;
  if (!coupon || typeof coupon === "string") return;
  return coupon;
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
    const percent = coupon?.percent_off ?? 0;
    if (!highestCoupon?.percent_off) return discount;
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

  // Stripe v18 (Basil) removed `Invoice.charge`. We can't expand the new
  // `payments` path deep enough to inspect refund state on the underlying
  // charge in one call (Stripe enforces a four-level expand limit), so the
  // charges-based loop runs first; it can detect refunds directly. The
  // invoice loop below covers invoiced purchases without payment-intent
  // metadata.
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

  // Basil also restructured invoice line items: the price is no longer inlined
  // on the line. The id lives under `line.pricing.price_details`, and we
  // retrieve the full Price separately. This fallback covers invoiced one-time
  // purchases that lack payment-intent metadata.
  for await (const invoice of stripe.invoices.list({
    customer,
    status: "paid",
    limit: 100,
  })) {
    for (const line of invoice.lines.data) {
      // `price` is typed `string | Price` (only an inlined Price when expanded,
      // which we don't do); `product` is always a string id on this surface.
      const linePrice = line.pricing?.price_details?.price;
      const lineProductId = line.pricing?.price_details?.product;
      if (!linePrice || !lineProductId) continue;
      if (lineProductId !== product.id) continue;
      const price = await stripe.prices.retrieve(getObjectId(linePrice));
      if (price.type !== "one_time") continue;
      // Verify the invoice's payments haven't been refunded. v18 (Basil)
      // removed the inlined `invoice.charge`; we list this invoice's payments
      // explicitly and check refunds per payment_intent or charge id.
      if (await invoicePaymentsRefunded(invoice.id)) continue;
      return Object.assign(price, { product });
    }
  }

  return;
}

async function invoicePaymentsRefunded(invoiceId: string) {
  if (!stripe) return false;
  // `invoice.payments` on a list response is unhydrated, so list payments for
  // this invoice explicitly. v22 `InvoicePayment.Payment.Type` can be
  // 'payment_intent' | 'charge' | 'payment_record'. We refund-check the first
  // two; 'payment_record' has no comparable refund concept exposed here.
  // $0 invoices created via 100% discount have no payments and stay treated
  // as not refunded.
  //
  // Note: this returns true on ANY refund (including partial), which is
  // stricter than the `charge.refunded` boolean used by the charges loop
  // above (which fires only on full refunds). The asymmetry is acceptable
  // because invoiced-only Plus purchases are rare and a partial refund
  // revoking access is the safer side to err on.
  for await (const payment of stripe.invoicePayments.list({
    invoice: invoiceId,
    status: "paid",
    limit: 100,
  })) {
    if (payment.payment.type === "payment_intent") {
      const pi = payment.payment.payment_intent;
      const piId = typeof pi === "string" ? pi : pi?.id;
      if (!piId) continue;
      const refunds = await stripe.refunds.list({
        payment_intent: piId,
        limit: 1,
      });
      if (refunds.data.length > 0) return true;
    } else if (payment.payment.type === "charge") {
      const c = payment.payment.charge;
      const chargeId = typeof c === "string" ? c : c?.id;
      if (!chargeId) continue;
      const refunds = await stripe.refunds.list({
        charge: chargeId,
        limit: 1,
      });
      if (refunds.data.length > 0) return true;
    }
  }
  return false;
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
        expand: ["data.promotion.coupon"],
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
        expand: ["data.promotion.coupon"],
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
      expand: ["data.promotion.coupon"],
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
    // v21 (API `2026-03-25.dahlia`) renamed `ui_mode: "embedded"` to
    // `"embedded_page"`. The embedded-checkout client surface
    // (`<EmbeddedCheckoutProvider>` + session `client_secret`) is unchanged.
    ui_mode: "embedded_page",
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

import { currentUser } from "@clerk/nextjs";
import { Stripe } from "stripe";
import { getStripeId } from "./clerk.js";
import { nonNullable } from "./non-nullable.js";

const key = process.env.STRIPE_SECRET_KEY;
const stripe = key ? new Stripe(key) : null;

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

export async function getActiveSubscriptions(customerId: string) {
  if (!stripe) return;
  const subscriptions = await stripe.subscriptions.list({
    customer: customerId,
    status: "active",
  });
  return subscriptions;
}

export async function getActiveCustomerByEmail(email: string) {
  if (!stripe) return;
  const customers = await stripe.customers.list({ email });
  const customer = customers.data.find((customer) => {
    if (customer.deleted) return false;
    return !!customer.subscriptions?.data.some((s) => s.status === "active");
  });
  return customer;
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
}

export async function createCheckout({
  priceId,
  returnUrl,
  customerId,
}: CreateCheckoutParams) {
  if (!stripe) return;

  const url = new URL(returnUrl);
  const customer = customerId ?? getStripeId(await currentUser());
  const pathname = customer ? "" : "/sign-up";

  const session = await stripe.checkout.sessions.create({
    customer,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    ui_mode: "embedded",
    return_url: `${url.origin}${pathname}?session-id={CHECKOUT_SESSION_ID}`,
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

export interface Price {
  id: string;
  currency: string;
  product: string;
  yearly: boolean;
  amount: number;
  amountByMonth: number;
  amountByYear: number;
  difference: number;
}

export async function getPrices(productName: string) {
  if (!stripe) return;

  const products = await stripe.products.list();
  const product = products.data.find((product) => product.name === productName);
  if (!product) return null;

  const prices = await stripe.prices.list({
    product: product.id,
    active: true,
  });

  const getInterval =
    (interval: Stripe.Price.Recurring.Interval) => (price: Stripe.Price) =>
      price.recurring?.interval === interval;

  const monthlyPrice = prices.data.find(getInterval("month"));
  const yearlyPrice = prices.data.find(getInterval("year"));

  return [monthlyPrice, yearlyPrice].filter(nonNullable).map((p) => {
    const yearly = p.recurring?.interval === "year";
    const amount = p.unit_amount || 0;
    const amountByMonth = yearly ? amount / 12 : amount;
    const amountByYear = yearly ? amount : amount * 12;
    const defaultMonthlyPrice =
      monthlyPrice?.unit_amount ?? (yearly ? amount / 12 : amount);

    return {
      id: p.id,
      currency: p.currency,
      product: p.product.toString(),
      yearly,
      amount,
      amountByMonth,
      amountByYear,
      difference: yearly
        ? Math.round((amountByMonth / defaultMonthlyPrice - 1) * 100) / 100
        : 0,
    } satisfies Price;
  });
}

"use server";
import { Stripe } from "stripe";
import { nonNullable } from "./non-nullable.js";

const key = process.env.STRIPE_SECRET_KEY;
const stripe = key ? new Stripe(key, { apiVersion: "2023-10-16" }) : null;

export interface CreateCheckoutSessionProps {
  priceId: string;
  returnUrl: string;
  customerId?: string;
}

export async function createCheckoutSession({
  priceId,
  returnUrl,
  customerId,
}: CreateCheckoutSessionProps) {
  if (!stripe) return;

  const url = new URL(returnUrl);
  const pathname = customerId ? "" : "/sign-up";

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    mode: "subscription",
    ui_mode: "embedded",
    return_url: `${url.origin}${pathname}?session-id={CHECKOUT_SESSION_ID}`,
  });

  return session.client_secret;
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
  const product = products.data.find((p) => p.name === productName);
  if (!product) return null;
  const prices = (
    await stripe.prices.list({ product: product.id })
  ).data.filter((p) => p.active);

  const monthlyPrice = prices.find((p) => p.recurring?.interval === "month");
  const yearlyPrice = prices.find((p) => p.recurring?.interval === "year");

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
      difference: yearly ? amountByMonth / defaultMonthlyPrice - 1 : 0,
    } satisfies Price;
  });
}

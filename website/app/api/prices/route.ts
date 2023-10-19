import { Stripe } from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
const stripe = key && new Stripe(key, { apiVersion: "2023-10-16" });

export interface Price {
  id: string;
  currency: string;
  product: string;
  yearly: boolean;
  amount: number;
}

export async function GET() {
  if (!stripe) {
    return new Response("Environment not configured", { status: 500 });
  }
  const products = await stripe.products.list();
  const product = products.data.find((p) => p.name === "Ariakit Plus");
  if (!product) {
    return new Response("Product not found", { status: 404 });
  }
  const prices = await stripe.prices.list({ product: product.id });
  const activePrices = prices.data
    .filter((p) => p.active)
    .reverse()
    .map(
      (price) =>
        ({
          id: price.id,
          currency: price.currency,
          product: price.product.toString(),
          yearly: price.recurring?.interval === "year",
          amount: price.unit_amount || 0,
        }) satisfies Price,
    );
  return Response.json(activePrices);
}

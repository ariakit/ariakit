import { getPrices } from "utils/stripe.js";

export async function GET() {
  const prices = await getPrices("Ariakit Plus");
  if (!prices) {
    return new Response("Product not found", { status: 404 });
  }
  return Response.json(prices);
}

import { getPlusPrice } from "utils/stripe.js";

export const dynamic = "force-dynamic";

export async function GET() {
  const price = await getPlusPrice();
  if (!price) {
    return new Response("Product not found", { status: 404 });
  }
  return Response.json(price);
}

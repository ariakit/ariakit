import { getPlusPrice } from "@/lib/stripe.ts";

export const dynamic = "force-dynamic";

export async function GET() {
  const price = await getPlusPrice();
  if (!price) {
    return Response.json(null, { status: 404 });
  }
  return Response.json(price);
}

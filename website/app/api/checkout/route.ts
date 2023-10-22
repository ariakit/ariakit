import type { NextRequest } from "next/server.js";
import { createCheckout } from "utils/stripe.js";
import { z } from "zod";

const schema = z.object({
  priceId: z.string().startsWith("price_"),
});

export async function POST(req: NextRequest) {
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json(parsed.error.flatten().fieldErrors, { status: 400 });
  }
  const { priceId } = parsed.data;
  const session = await createCheckout({
    priceId,
    returnUrl: req.nextUrl.origin,
  });

  return Response.json(session?.client_secret);
}

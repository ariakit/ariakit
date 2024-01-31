import type { NextRequest } from "next/server.js";
import { createCheckout } from "utils/stripe.js";
import { z } from "zod";

export async function POST(req: NextRequest) {
  const schema = z.object({
    priceId: z.string().startsWith("price_"),
    redirectUrl: z.string().optional(),
  });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json(parsed.error.flatten().fieldErrors, { status: 400 });
  }
  const { priceId, redirectUrl } = parsed.data;

  const finalRedirectUrl = new URL(redirectUrl || "/", req.nextUrl.origin);

  const session = await createCheckout({
    priceId,
    redirectUrl: finalRedirectUrl,
  });

  return Response.json({
    checkoutSessionId: session?.id || null,
    clientSecret: session?.client_secret || null,
  });
}

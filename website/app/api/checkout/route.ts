import type { NextRequest } from "next/server.ts";
import { z } from "zod";
import { getCurrentUser } from "@/lib/clerk.ts";
import { createCheckout } from "@/lib/stripe.ts";

export async function POST(req: NextRequest) {
  const schema = z.object({
    priceId: z.string().startsWith("price_"),
    redirectUrl: z.string().optional(),
    promotionCode: z.string().optional(),
  });

  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json(parsed.error.flatten().fieldErrors, { status: 400 });
  }
  const { priceId, redirectUrl, promotionCode } = parsed.data;

  const finalRedirectUrl = new URL(redirectUrl || "/", req.nextUrl.origin);
  const user = await getCurrentUser();

  if (!user) {
    return Response.json(null, { status: 401 });
  }

  const session = await createCheckout({
    price: priceId,
    redirectUrl: finalRedirectUrl,
    promotionCode,
    user,
  });

  return Response.json({
    id: session?.id || null,
    clientSecret: session?.client_secret || null,
  });
}

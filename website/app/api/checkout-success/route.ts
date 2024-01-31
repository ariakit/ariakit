import { currentUser } from "@clerk/nextjs";
import type { NextRequest } from "next/server.js";
import { getStripeId } from "utils/clerk.js";
import {
  cancelSubscription,
  filterPlusSubscriptions,
  getStripeClient,
  listActiveSubscriptions,
} from "utils/stripe.js";
import { z } from "zod";

const paramsSchema = z
  .object({
    session_id: z.string().startsWith("cs_"),
    redirect_url: z.string().optional(),
  })
  .transform((data) => ({
    sessionId: data.session_id,
    redirectUrl: data.redirect_url,
  }));

export async function GET(req: NextRequest) {
  const stripeId = getStripeId(await currentUser());
  if (!stripeId) return new Response("Unauthorized", { status: 401 });

  const stripe = getStripeClient();
  if (!stripe) return new Response("Server error", { status: 500 });

  const parsed = paramsSchema.safeParse(
    Object.fromEntries(req.nextUrl.searchParams.entries()),
  );

  if (!parsed.success) {
    return Response.json(parsed.error.flatten().fieldErrors, { status: 400 });
  }

  const { sessionId, redirectUrl } = parsed.data;
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.customer !== stripeId) {
    return new Response("Unauthorized", { status: 401 });
  }

  if (session.mode === "payment" && session.payment_status === "paid") {
    const subscriptions = filterPlusSubscriptions(
      await listActiveSubscriptions(stripeId),
    );
    if (subscriptions?.length) {
      await Promise.all(subscriptions.map((s) => cancelSubscription(s.id)));
    }
  }

  if (redirectUrl) {
    return Response.redirect(redirectUrl);
  }

  return Response.json("OK");
}

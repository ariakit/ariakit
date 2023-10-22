import type { NextRequest } from "next/server.js";
import { getStripeId } from "utils/clerk.js";
import { getActiveSubscriptions, getStripeClient } from "utils/stripe.js";
import { z } from "zod";

const schema = z
  .object({
    priceId: z.string().startsWith("price_").optional(),
  })
  .optional();

async function getRequestBody(request: Request) {
  const contentType = request.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return request.json();
  }
  if (contentType?.includes("application/x-www-form-urlencoded")) {
    return Object.fromEntries(await request.formData());
  }
  return null;
}

export async function POST(request: NextRequest) {
  const stripeId = getStripeId();
  if (!stripeId) return new Response("Unauthorized", { status: 401 });

  const stripe = getStripeClient();
  if (!stripe) return new Response(null, { status: 500 });

  const parsed = schema.safeParse(await getRequestBody(request));

  if (!parsed.success) {
    return Response.json(parsed.error.flatten().fieldErrors, { status: 400 });
  }

  const { priceId } = parsed.data || {};

  if (priceId) {
    const subscriptions = await getActiveSubscriptions(stripeId);
    const subscription = subscriptions?.data[0];
    const item = subscription?.items.data[0];

    if (subscription && item) {
      const session = await stripe.billingPortal.sessions.create({
        customer: stripeId,
        return_url: request.nextUrl.origin,
        flow_data: {
          type: "subscription_update_confirm",
          subscription_update_confirm: {
            subscription: subscription.id,
            items: [{ id: item.id, price: priceId, quantity: 1 }],
          },
        },
      });
      return Response.redirect(session.url);
    }
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: stripeId,
    return_url: request.nextUrl.origin,
  });

  return Response.redirect(session.url);
}

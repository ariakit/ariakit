import { getStripeId } from "utils/clerk.js";
import { getActiveSubscriptions } from "utils/stripe.js";

export async function GET() {
  const stripeId = getStripeId();
  if (!stripeId) return new Response("Unauthorized", { status: 401 });

  const subscriptions = await getActiveSubscriptions(stripeId);
  const subscription = subscriptions?.data[0];
  const item = subscription?.items.data[0];

  if (!subscription || !item) {
    return Response.json(null);
  }

  return Response.json(item.price.id);
}

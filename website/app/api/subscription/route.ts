import { currentUser } from "@clerk/nextjs/server";
import { getStripeId } from "utils/clerk.js";
import { getActiveSubscriptions } from "utils/stripe.js";

export async function GET() {
  const stripeId = getStripeId(await currentUser());
  if (!stripeId) {
    return Response.json("");
  }
  const subscriptions = await getActiveSubscriptions(stripeId);
  const subscription = subscriptions?.data[0];
  const item = subscription?.items.data[0];

  if (!subscription || !item) {
    return Response.json("");
  }

  return Response.json(item.price.id);
}

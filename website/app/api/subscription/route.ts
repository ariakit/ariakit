import { currentUser } from "@clerk/nextjs/server";
import { getStripeId } from "@/lib/clerk.ts";
import {
  findSubscriptionPlusPrice,
  getActivePlusPrice,
  getObjectId,
  listActiveSubscriptions,
} from "@/lib/stripe.ts";

export async function GET() {
  const stripeId = getStripeId(await currentUser());
  if (!stripeId) {
    return Response.json(null, { status: 404 });
  }
  const price = await getActivePlusPrice(stripeId);

  if (!price) {
    const activeSubscriptions = await listActiveSubscriptions(stripeId);
    const subscriptionPrice = findSubscriptionPlusPrice(activeSubscriptions);
    if (!subscriptionPrice) {
      return Response.json(null, { status: 404 });
    }
    return Response.json({
      price: subscriptionPrice.id,
      product: getObjectId(subscriptionPrice.product),
      recurring: !!subscriptionPrice.recurring,
    });
  }

  return Response.json({
    price: price.id,
    product: price.product.id,
    recurring: !!price.recurring,
  });
}

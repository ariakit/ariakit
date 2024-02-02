import { currentUser } from "@clerk/nextjs/server";
import { getStripeId } from "utils/clerk.js";
import { getActivePlusPrice } from "utils/stripe.js";

export async function GET() {
  const stripeId = getStripeId(await currentUser());
  if (!stripeId) {
    return Response.json(null, { status: 404 });
  }
  const price = await getActivePlusPrice(stripeId);

  if (!price) {
    return Response.json(null, { status: 404 });
  }

  return Response.json({
    price: price.id,
    product: price.product.id,
    recurring: !!price.recurring,
  });
}

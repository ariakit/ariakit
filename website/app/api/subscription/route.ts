import { currentUser } from "@clerk/nextjs/server";
import { getStripeId } from "utils/clerk.js";
import { getCustomerPlusPrice } from "utils/stripe.js";

export async function GET() {
  const stripeId = getStripeId(await currentUser());
  if (!stripeId) {
    return Response.json("User not found", { status: 404 });
  }
  const price = await getCustomerPlusPrice(stripeId);

  if (!price) {
    return Response.json("Subscription not found", { status: 404 });
  }

  return Response.json(price.id);
}

import { currentUser } from "@clerk/nextjs/server";
import { getStripeId } from "utils/clerk.js";
import { isPlusCustomer } from "utils/stripe.js";

export async function GET() {
  const stripeId = getStripeId(await currentUser());
  if (!stripeId) {
    return Response.json("");
  }
  const price = await isPlusCustomer({ customerId: stripeId });

  if (!price) {
    return Response.json("");
  }

  return Response.json(price.id);
}

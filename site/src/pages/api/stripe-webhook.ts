import type { APIRoute } from "astro";
import type { Stripe } from "stripe";
import { addPlusToUser, getUser } from "#app/lib/clerk.ts";
import { createLogger } from "#app/lib/logger.ts";
import { getStripeClient } from "#app/lib/stripe.ts";

export const prerender = false;
const logger = createLogger("stripe-webhook");

function ok(...logs: any[]) {
  logger.info(...logs);
  return new Response("OK", { status: 200 });
}

function badRequest(...logs: any[]) {
  logger.error(...logs);
  return new Response("Bad request", { status: 400 });
}

function notFound(...logs: any[]) {
  logger.error(...logs);
  return new Response("Not found", { status: 404 });
}

function internalServerError(...logs: any[]) {
  logger.error(...logs);
  return new Response("Internal server error", { status: 500 });
}

export const POST: APIRoute = async (context) => {
  const stripe = getStripeClient();
  if (!stripe) {
    return internalServerError("Stripe not configured");
  }
  const signature = context.request.headers.get("stripe-signature");
  if (!signature) {
    return badRequest("No signature");
  }
  const secret = import.meta.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return internalServerError("Stripe webhook secret not configured");
  }

  const body = await context.request.text();
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, secret);
  } catch (err) {
    return badRequest("Webhook error:", err);
  }

  const getUserFromCustomer = async (
    customerId?: string | Stripe.Customer | Stripe.DeletedCustomer | null,
  ) => {
    if (typeof customerId !== "string") {
      return badRequest("Invalid customer ID", customerId);
    }
    const customer = await stripe.customers.retrieve(customerId);
    if (customer.deleted) {
      return notFound("Customer deleted", customerId);
    }
    const { clerkId } = customer.metadata;
    if (!clerkId) {
      return notFound("Customer has no Clerk ID", customerId);
    }
    const user = await getUser({ context, user: clerkId });
    if (!user) {
      return notFound("User not found", clerkId);
    }
    return user;
  };

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object;
    if (session.payment_status === "unpaid") {
      return ok("Checkout session not paid", session.id);
    }
    const user = await getUserFromCustomer(session.customer);
    if (user instanceof Response) {
      return user;
    }
    if (typeof session.payment_intent !== "string") {
      return badRequest("Invalid payment intent", session.id);
    }
    const pi = await stripe.paymentIntents.retrieve(session.payment_intent);
    if (pi.status !== "succeeded") {
      return badRequest("Payment intent not succeeded", session.id);
    }
    const productId = pi.metadata.product;
    if (!productId) {
      return badRequest("No product in payment intent metadata", session.id);
    }
    const product = await stripe.products.retrieve(productId);
    const { plusType } = product.metadata;
    if (!plusType) {
      return badRequest("No plus type in product metadata", session.id);
    }
    await addPlusToUser({
      context,
      user,
      type: plusType,
      amount: pi.amount_received,
      currency: pi.currency,
    });
    return ok();
  }
  return ok();
};

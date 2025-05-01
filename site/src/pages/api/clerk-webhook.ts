import { type WebhookEvent, verifyWebhook } from "@clerk/astro/webhooks";
import type { APIRoute } from "astro";
import { getUser, isClerkEnabled, removePlusFromUser } from "#app/lib/clerk.ts";
import { createLogger } from "#app/lib/logger.ts";
import { createCustomerWithClerkUser } from "#app/lib/stripe.ts";

export const prerender = false;
const logger = createLogger("clerk-webhook");

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
  if (!isClerkEnabled()) {
    return internalServerError("Clerk is not enabled");
  }
  const secret = import.meta.env.CLERK_WEBHOOK_SECRET;
  if (!secret) {
    return internalServerError("Clerk webhook secret not configured");
  }

  let event: WebhookEvent;

  try {
    event = await verifyWebhook(context.request, { signingSecret: secret });
  } catch (err) {
    return badRequest("Webhook error:", err);
  }

  if (event.type === "user.created") {
    const user = await getUser({ context, user: event.data.id });
    if (!user) {
      return notFound("User not found", event.data.id);
    }
    const customer = await createCustomerWithClerkUser(context, user);
    if (!customer) {
      return internalServerError("Failed to create Stripe customer");
    }
    return ok("Created Stripe customer for user", user.id);
  }

  if (event.type === "organization.created") {
    if (!event.data.created_by) {
      return ok("Organization created by unknown user", event.data.id);
    }
    const user = await getUser({ context, user: event.data.created_by });
    if (!user) {
      return notFound("Creator of organization not found", event.data.id);
    }
    await removePlusFromUser({ context, user });
    return ok("Removed team plus from user", user.id);
  }

  return ok();
};

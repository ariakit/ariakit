import { type WebhookEvent, verifyWebhook } from "@clerk/astro/webhooks";
import type { APIRoute } from "astro";
import { isClerkEnabled, removePlusFromUser } from "#app/lib/clerk.ts";
import { createLogger } from "#app/lib/logger.ts";
import { badRequest, internalServerError, ok } from "#app/lib/response.ts";
import { createCustomer } from "#app/lib/stripe.ts";

export const prerender = false;

const logger = createLogger("clerk-webhook");

export const POST: APIRoute = async (context) => {
  if (!isClerkEnabled()) {
    logger.error("Clerk is not enabled");
    return internalServerError();
  }
  const signingSecret = import.meta.env.CLERK_WEBHOOK_SECRET;
  if (!signingSecret) {
    logger.error("Clerk webhook secret not configured");
    return internalServerError();
  }

  let event: WebhookEvent;

  try {
    event = await verifyWebhook(context.request, { signingSecret });
  } catch (err) {
    logger.error("Webhook error:", err);
    return badRequest();
  }

  if (event.type === "user.created") {
    const user = event.data;
    const email = user.email_addresses[0]?.email_address;
    await createCustomer({ context, user: user.id, email });
    return ok();
  }

  if (event.type === "organization.created") {
    const creatorId = event.data.created_by;
    if (!creatorId) {
      logger.error("Organization created by unknown user", event.data.id);
      return ok();
    }
    await removePlusFromUser({ context, user: creatorId });
    return ok();
  }

  return ok();
};

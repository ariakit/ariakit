/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { APIRoute } from "astro";
import { z } from "zod";
import { getCurrentUserId, getCustomer } from "#app/lib/auth.ts";
import { URLSchema } from "#app/lib/schemas.ts";
import { getStripeClient } from "#app/lib/stripe.ts";
import {
  getPlusAccountPath,
  getPlusAccountURL,
  getPlusCheckoutPath,
} from "#app/lib/url.ts";

export const prerender = false;

const querySchema = z
  .object({
    redirect_url: URLSchema,
  })
  .transform((data) => ({
    redirectUrl: data.redirect_url,
  }));

export const GET: APIRoute = async (context) => {
  const userId = getCurrentUserId(context);

  if (!userId) {
    return context.redirect(
      getPlusAccountPath({ url: context.url, path: "login" }),
    );
  }

  const stripe = getStripeClient();
  if (!stripe) {
    return context.redirect("/");
  }

  const customer = await getCustomer({ context, user: userId });
  if (!customer) {
    return context.redirect(getPlusCheckoutPath({ url: context.url }));
  }

  const { redirectUrl } = querySchema.parse(
    Object.fromEntries(context.url.searchParams),
  );

  const returnUrl = redirectUrl
    ? new URL(redirectUrl, context.url)
    : getPlusAccountURL({ url: context.url });

  const session = await stripe.billingPortal.sessions.create({
    customer,
    return_url: returnUrl.toString(),
  });

  return context.redirect(session.url);
};

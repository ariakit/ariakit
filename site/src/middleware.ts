/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { getActionContext } from "astro:actions";
import { clerkMiddleware } from "@clerk/astro/server";
import type { APIContext, MiddlewareNext } from "astro";
import { isAdmin } from "./lib/auth.ts";
import { getNextjsPreviewId, getNextjsUrlFromRequest } from "./lib/nextjs.ts";
import { unauthorized } from "./lib/response.ts";

const clerk = clerkMiddleware();

export async function onRequest(context: APIContext, next: MiddlewareNext) {
  const url = new URL(context.request.url);

  console.log("URL", url);

  // Check if this is a Next.js preview request and redirect
  const nextjsExampleId = getNextjsPreviewId(url.pathname);
  if (nextjsExampleId) {
    const nextjsUrl = getNextjsUrlFromRequest(url.href, `/${nextjsExampleId}`);
    return context.redirect(nextjsUrl, 302);
  }

  const { action } = getActionContext(context);

  const isAdminAction = action?.name.startsWith("admin");

  if (!import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY) {
    if (isAdminAction) {
      return unauthorized();
    }
    return next();
  }

  const response = await clerk(context, next);

  if (isAdminAction && !(await isAdmin(context))) {
    return unauthorized();
  }

  return response;
}

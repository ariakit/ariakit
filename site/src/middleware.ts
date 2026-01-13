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
import { unauthorized } from "./lib/response.ts";

const clerk = clerkMiddleware();

function isPublicRoute(url: URL) {
  if (url.pathname.startsWith("/r/")) return true;
  return false;
}

export async function onRequest(context: APIContext, next: MiddlewareNext) {
  const { action } = getActionContext(context);
  const isAdminAction = action?.name.startsWith("admin");

  if (!import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY) {
    if (isAdminAction) {
      return unauthorized();
    }
    return next();
  }

  if (isPublicRoute(context.url)) {
    return next();
  }

  const response = await clerk(context, next);

  if (isAdminAction && !(await isAdmin(context))) {
    return unauthorized();
  }

  return response;
}

/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { clerkMiddleware as createClerkMiddleware } from "@clerk/astro/server";
import type { APIContext, MiddlewareNext } from "astro";
import { getActionContext } from "astro:actions";
import { unauthorized } from "./lib/response.ts";

let clerk: ReturnType<typeof createClerkMiddleware> | undefined;

async function getClerkMiddleware() {
  if (clerk) {
    return clerk;
  }
  // Avoid evaluating Clerk's server module when Clerk is disabled. The module
  // eagerly imports Node async storage and keyless file-storage helpers.
  const { clerkMiddleware } = await import("@clerk/astro/server");
  clerk = clerkMiddleware();
  return clerk;
}

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

  const clerk = await getClerkMiddleware();
  const response = await clerk(context, next);

  if (isAdminAction) {
    // auth.ts imports Clerk's server module too, so keep it behind the same
    // Clerk-enabled branch.
    const { isAdmin } = await import("./lib/auth.ts");
    if (!(await isAdmin(context))) {
      return unauthorized();
    }
  }

  return response;
}

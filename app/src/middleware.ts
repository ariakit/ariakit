/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import { clerkMiddleware } from "@clerk/astro/server";
import type { APIContext, MiddlewareNext } from "astro";
import { getActionContext } from "astro:actions";
import { isAdmin } from "./lib/auth.ts";
import { unauthorized } from "./lib/response.ts";

let clerk: ReturnType<typeof clerkMiddleware> | undefined;

function getClerkMiddleware() {
  clerk ??= clerkMiddleware();
  return clerk;
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

  if (isAdminAction) {
    const guardedNext: MiddlewareNext = async () => {
      if (!(await isAdmin(context))) {
        return unauthorized();
      }
      return next();
    };
    return getClerkMiddleware()(context, guardedNext);
  }

  return getClerkMiddleware()(context, next);
}

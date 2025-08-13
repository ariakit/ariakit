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
import type { Response as CfResponse } from "@cloudflare/workers-types";
import type { APIContext, MiddlewareNext } from "astro";
import { isAdmin } from "./lib/auth.ts";
import { unauthorized } from "./lib/response.ts";

const clerk = clerkMiddleware();

async function cachePartials(context: APIContext, next: MiddlewareNext) {
  const runtime = context.locals.runtime;
  const cache = runtime.caches.default;
  const cacheKey = new URL(context.request.url);
  const cached = await cache.match(cacheKey);
  if (cached) return cached;

  const response = await next();
  if (!response.ok) return response;

  try {
    // avoid caching personalized content
    response.headers.delete("set-cookie");
  } catch {}
  if (!response.headers.has("Cache-Control")) {
    response.headers.set("Cache-Control", "public, s-maxage=86400, max-age=0");
  }
  // Store without adding latency if possible
  const responseForCache = response.clone() as unknown as CfResponse;
  const putPromise = cache.put(cacheKey, responseForCache);
  const { waitUntil } = runtime.ctx;
  waitUntil(putPromise);
  response.headers.set(
    "Cache-Status",
    "Cloudflare; miss; stored=workers-cache",
  );
  return response;
}

export async function onRequest(context: APIContext, next: MiddlewareNext) {
  const { action } = getActionContext(context);
  const isPartialPath = context.url.pathname.includes("/partials/");

  if (isPartialPath) {
    return cachePartials(context, next);
  }

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

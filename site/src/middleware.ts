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
import { trimRight } from "./lib/string.ts";

const clerk = clerkMiddleware();

async function cachePartials(context: APIContext, next: MiddlewareNext) {
  if (context.request.method !== "GET") {
    return next();
  }
  const runtime = context.locals.runtime;
  const cache = runtime.caches.default;

  const cacheUrl = new URL(context.request.url);
  cacheUrl.pathname = trimRight(cacheUrl.pathname, "/");
  const item = cacheUrl.searchParams.get("item");
  cacheUrl.search = item ? `?item=${item}` : "";
  const cacheKey = cacheUrl.toString();

  const cached = await cache.match(cacheKey);
  if (cached) {
    const headers = new Headers(Array.from(cached.headers.entries()));
    const body = await cached.arrayBuffer();
    return new Response(body, {
      status: cached.status,
      statusText: cached.statusText,
      headers,
    });
  }

  const response = await next();
  if (!response.ok) return response;
  try {
    // avoid caching personalized content
    response.headers.delete("set-cookie");
  } catch {}
  if (!response.headers.has("Cache-Control")) {
    response.headers.set("Cache-Control", "public, s-maxage=86400, max-age=0");
  }
  const responseForCache = response.clone() as unknown as CfResponse;
  const { waitUntil } = runtime.ctx;
  waitUntil(cache.put(cacheKey, responseForCache));
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

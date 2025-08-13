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
  const cacheUrl = new URL(context.request.url);
  // Ignore query strings
  cacheUrl.search = "";
  // Ignore trailing slashes except for root
  if (cacheUrl.pathname.length > 1) {
    cacheUrl.pathname = cacheUrl.pathname.replace(/\/+$/, "");
  }
  const cacheKey = cacheUrl.toString();

  if (context.request.method !== "GET") {
    return next();
  }

  const cached = await cache.match(cacheKey);
  if (cached) {
    // Recreate a mutable response so downstream code can safely set headers
    const headerPairs: [string, string][] = [];
    cached.headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") return;
      headerPairs.push([key, value]);
    });
    headerPairs.push(["Cache-Status", "Cloudflare; hit; source=workers-cache"]);
    const body = await cached.arrayBuffer();
    return new Response(body, {
      status: cached.status,
      statusText: cached.statusText,
      headers: headerPairs,
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

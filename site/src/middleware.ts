import { clerkMiddleware } from "@clerk/astro/server";
import type { APIContext, MiddlewareNext } from "astro";

const clerk = clerkMiddleware();

export async function onRequest(context: APIContext, next: MiddlewareNext) {
  if (!import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY) {
    return next();
  }
  return clerk(context, next);
}

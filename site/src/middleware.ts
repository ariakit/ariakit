import { clerkMiddleware } from "@clerk/astro/server";
import type { APIContext, MiddlewareNext } from "astro";

const clerk = clerkMiddleware();

export async function onRequest(context: APIContext, next: MiddlewareNext) {
  if (context.url.pathname.includes("/previews")) {
    return next();
  }
  return clerk(context, next);
}

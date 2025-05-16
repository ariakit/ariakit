import { getActionContext } from "astro:actions";
import { clerkMiddleware } from "@clerk/astro/server";
import type { APIContext, MiddlewareNext } from "astro";
import { isAdmin } from "./lib/clerk.ts";
import { unauthorized } from "./lib/response.ts";

const clerk = clerkMiddleware();

export async function onRequest(context: APIContext, next: MiddlewareNext) {
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

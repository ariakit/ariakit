import { clerkMiddleware } from "@clerk/nextjs/server";
import type { NextFetchEvent, NextRequest } from "next/server.ts";

export const config = {
  matcher: ["/api(.*)"],
};

const runClerkMiddleware = clerkMiddleware();

export function proxy(request: NextRequest, event: NextFetchEvent) {
  if (!process.env.CLERK_SECRET_KEY) return;
  return runClerkMiddleware(request, event);
}

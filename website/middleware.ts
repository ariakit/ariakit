import { clerkMiddleware } from "@clerk/nextjs/server";
import type { NextFetchEvent, NextRequest } from "next/server.ts";

export const config = {
  matcher: ["/api(.*)"],
};

const withAuth = clerkMiddleware();

export function middleware(request: NextRequest, event: NextFetchEvent) {
  if (!process.env.CLERK_SECRET_KEY) return;
  if (!request.cookies.size) return;

  return withAuth(request, event);
}

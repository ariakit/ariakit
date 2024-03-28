import { authMiddleware } from "@clerk/nextjs";
import type { NextFetchEvent, NextRequest } from "next/server.ts";

export const config = {
  matcher: ["/api(.*)"],
};

export function middleware(request: NextRequest, event: NextFetchEvent) {
  if (!process.env.CLERK_SECRET_KEY) return;
  if (!request.cookies.size) return;

  const withAuth = authMiddleware({
    publicRoutes() {
      return true;
    },
  });

  return withAuth(request, event);
}

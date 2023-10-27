import { authMiddleware } from "@clerk/nextjs";
import { NextResponse } from "next/server.js";
import type { NextFetchEvent, NextRequest } from "next/server.js";
import {
  getActiveSubscriptions,
  getClerkClient,
  getPrimaryEmailAddress,
  getStripeId,
  updateUserWithStripeId,
} from "utils/clerk.js";
import {
  createCustomerWithClerkId,
  getCheckout,
  getCustomer,
  getStripeClient,
  updateCustomerWithClerkId,
} from "utils/stripe.js";

export const config = {
  matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};

export function middleware(request: NextRequest, event: NextFetchEvent) {
  if (!process.env.CLERK_SECRET_KEY) return;

  const withAuth = authMiddleware({
    publicRoutes() {
      return true;
    },

    async beforeAuth() {
      const url = new URL(request.nextUrl);
      const sessionId = url.searchParams.get("session-id");
      if (!sessionId) return;

      const currentSessionId = request.cookies.get("stripe-session-id");
      if (currentSessionId?.value === sessionId) return;

      const stripe = getStripeClient();
      if (!stripe) return;

      const session = await getCheckout(sessionId);

      if (!session) {
        url.searchParams.delete("session-id");
        return NextResponse.redirect(url);
      }
      if (session.status !== "complete") return;
      if (session.payment_status !== "paid") return;

      const res = NextResponse.next();
      res.cookies.set("stripe-session-id", sessionId);
      return res;
    },

    async afterAuth(auth) {
      const { userId } = auth;
      if (!userId) return;

      const clerk = getClerkClient();
      const stripe = getStripeClient();
      if (!clerk) return;
      if (!stripe) return;

      const user = await clerk.users.getUser(userId);
      if (!user) return;

      const stripeSessionId = request.cookies.get("stripe-session-id")?.value;
      const stripeId = getStripeId(user);
      if (stripeId && !stripeSessionId) return;

      const response = NextResponse.next();

      if (stripeSessionId) {
        const session = await getCheckout(stripeSessionId);

        if (
          session?.status === "complete" &&
          typeof session?.customer === "string"
        ) {
          const customer = await getCustomer(session.customer);
          if (customer?.metadata.clerkId) {
            response.cookies.set("stripe-session-id", "");
          } else {
            const activeSubscriptions = await getActiveSubscriptions(user);
            if (!activeSubscriptions?.data.length) {
              await updateCustomerWithClerkId(session.customer, userId);
              await updateUserWithStripeId(userId, session.customer);
              response.cookies.set("stripe-session-id", "");
              return response;
            }
          }
        }
      }

      if (stripeId) return response;

      const email = getPrimaryEmailAddress(user);
      const customer = await createCustomerWithClerkId(userId, { email });
      if (!customer) return response;

      await updateUserWithStripeId(userId, customer.id);
      return response;
    },
  });

  return withAuth(request, event);
}

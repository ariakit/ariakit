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

export function middleware(req: NextRequest, event: NextFetchEvent) {
  if (!process.env.CLERK_SECRET_KEY) return;

  const withAuth = authMiddleware({
    publicRoutes() {
      return true;
    },

    async beforeAuth() {
      const url = new URL(req.nextUrl);
      const sessionId = url.searchParams.get("session-id");
      if (!sessionId) return;
      const currentSessionId = req.cookies.get("stripe-session-id");
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

      const stripeSessionId = req.cookies.get("stripe-session-id")?.value;
      const stripeId = getStripeId(auth);
      if (stripeId && !stripeSessionId) return;

      const clerk = getClerkClient();
      const stripe = getStripeClient();
      if (!clerk) return;
      if (!stripe) return;

      const res = NextResponse.next();

      if (stripeSessionId) {
        const session = await getCheckout(stripeSessionId);

        if (
          session?.status === "complete" &&
          typeof session?.customer === "string"
        ) {
          const customer = await getCustomer(session.customer);
          if (customer?.metadata.clerkId) {
            res.cookies.set("stripe-session-id", "");
          } else {
            const activeSubscriptions = await getActiveSubscriptions(auth);
            if (!activeSubscriptions?.data.length) {
              await updateCustomerWithClerkId(session.customer, userId);
              await updateUserWithStripeId(userId, session.customer);
              res.cookies.set("stripe-session-id", "");
              return res;
            }
          }
        }
      }

      if (stripeId) return res;

      const user = await clerk.users.getUser(userId);

      const email = getPrimaryEmailAddress(user);
      const customer = await createCustomerWithClerkId(userId, { email });
      if (!customer) return res;

      await updateUserWithStripeId(userId, customer.id);
      return res;
    },
  });

  return withAuth(req, event);
}

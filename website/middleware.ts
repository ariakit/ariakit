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
  getActiveCustomerByEmailWithoutClerkId,
  getCheckout,
  getCustomer,
  getStripeClient,
  updateCustomerWithClerkId,
} from "utils/stripe.js";

export const config = {
  matcher: ["/api(.*)", "/sign-up(.*)"],
};

export function middleware(request: NextRequest, event: NextFetchEvent) {
  if (!process.env.CLERK_SECRET_KEY) return;
  if (!request.cookies.size) return;

  const withAuth = authMiddleware({
    publicRoutes() {
      return true;
    },

    async beforeAuth() {
      const url = new URL(request.nextUrl);
      const sessionId = url.searchParams.get("session-id");
      if (!sessionId) return;

      const currentSessionId = request.cookies.get("stripe-session-id");
      if (currentSessionId?.value === sessionId) {
        console.log("Before auth: session-id search param matches cookie");
        return;
      }

      const stripe = getStripeClient();
      if (!stripe) return;

      const session = await getCheckout(sessionId);

      if (!session) {
        console.log("Before auth: session not found");
        url.searchParams.delete("session-id");
        return NextResponse.redirect(url);
      }
      if (session.status !== "complete") {
        console.log("Before auth: session not complete");
        return;
      }
      if (session.payment_status !== "paid") {
        console.log("Before auth: session not paid");
        return;
      }

      const res = NextResponse.next();
      res.cookies.set("stripe-session-id", sessionId);
      console.log("Before auth: session-id cookie set");
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
      if (stripeId && !stripeSessionId) {
        console.log(
          `After auth: stripeId ${stripeId} found, no session-id cookie`,
        );
        return;
      }

      const response = NextResponse.next();

      if (stripeSessionId) {
        const session = await getCheckout(stripeSessionId);

        if (
          session?.status === "complete" &&
          typeof session?.customer === "string"
        ) {
          const customer = await getCustomer(session.customer);
          if (customer?.metadata.clerkId) {
            console.log("After auth: customer already has clerkId");
            response.cookies.set("stripe-session-id", "");
          } else {
            console.log("After auth: customer has no clerkId");
            const activeSubscriptions = await getActiveSubscriptions(user);
            if (!activeSubscriptions?.data.length) {
              console.log(
                "After auth: user has no active subscriptions, connecting customer to user",
              );
              await updateCustomerWithClerkId(session.customer, userId);
              await updateUserWithStripeId(userId, session.customer);
              response.cookies.set("stripe-session-id", "");
              return response;
            }
          }
        }
      }

      if (stripeId) {
        console.log(
          `After auth: user ${userId} already has stripeId ${stripeId}`,
        );
        return response;
      }

      const email = getPrimaryEmailAddress(user);
      if (!email) {
        console.log(`After auth: user ${userId} has no primary email address`);
        return NextResponse.error();
      }

      let customer = await getActiveCustomerByEmailWithoutClerkId(email);

      if (customer) {
        console.log(
          `After auth: active customer ${customer.id} found, setting clerkId ${userId}`,
        );
        await updateCustomerWithClerkId(customer.id, userId);
      } else {
        console.log(
          `After auth: no active customer found for email ${email}, creating one for user ${userId}`,
        );
        customer = await createCustomerWithClerkId(userId, { email });
      }

      if (!customer) {
        console.log("After auth: could not create customer");
        return NextResponse.error();
      }

      await updateUserWithStripeId(userId, customer.id);
      console.log("After auth: user updated with stripeId");
      return response;
    },
  });

  return withAuth(request, event);
}

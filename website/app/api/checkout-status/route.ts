import { Stripe } from "stripe";

const key = process.env.STRIPE_SECRET_KEY;
const stripe = key && new Stripe(key, { apiVersion: "2023-10-16" });

export interface CheckoutStatus {
  status: Stripe.Checkout.Session.Status;
  paymentStatus: string;
  customerId: string;
  emailAdress: string;
}

export async function GET(req: Request) {
  if (!stripe) {
    return new Response("Stripe is not configured", { status: 500 });
  }
  const url = new URL(req.url);
  const sessionId = url.searchParams.get("session-id");
  if (!sessionId) {
    return new Response("No session id provided", { status: 400 });
  }
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (!session.status) {
    return new Response("Session not found", { status: 404 });
  }

  if (typeof session.customer !== "string") {
    return new Response("Customer not found", { status: 404 });
  }

  if (typeof session.customer_details?.email !== "string") {
    return new Response("Customer email not found", { status: 404 });
  }

  if (typeof session.customer_details?.name !== "string") {
    return new Response("Customer name not found", { status: 404 });
  }

  return Response.json({
    status: session.status,
    paymentStatus: session.payment_status,
    customerId: session.customer,
    emailAdress: session.customer_details.email,
  } satisfies CheckoutStatus);
}

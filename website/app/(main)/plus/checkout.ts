"use server";
import { Stripe } from "stripe";

const key = process.env.STRIPE_SECRET_KEY;

const stripe = key && new Stripe(key, { apiVersion: "2023-10-16" });

export async function checkout(price: string, returnUrl: string) {
  if (!stripe) return;
  const url = new URL(returnUrl);

  const session = await stripe.checkout.sessions.create({
    line_items: [{ price, quantity: 1 }],
    mode: "subscription",
    ui_mode: "embedded",
    return_url: `${url.origin}${url.pathname}?session-id={CHECKOUT_SESSION_ID}`,
  });

  return session.client_secret;
}

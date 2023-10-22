import { auth } from "@clerk/nextjs";
import { clerkClient } from "@clerk/nextjs/api";
import type {
  SignedInAuthObject,
  SignedOutAuthObject,
  User,
} from "@clerk/nextjs/api";
import * as Stripe from "./stripe.js";

const clerk = process.env.CLERK_SECRET_KEY ? clerkClient : null;

export function getClerkClient() {
  return clerk;
}

export function getStripeId(
  user?: SignedInAuthObject | SignedOutAuthObject | User,
) {
  if (!clerk) return;
  user = user ?? auth();
  if ("publicMetadata" in user) {
    return user.publicMetadata.stripeId as string | undefined;
  }
  return user.sessionClaims?.stripeId as string | undefined;
}

export async function updateUserWithStripeId(userId: string, stripeId: string) {
  if (!clerk) return;
  const user = await clerk.users.updateUser(userId, {
    publicMetadata: { stripeId },
  });
  return user;
}

export async function getActiveSubscriptions(
  user: SignedInAuthObject | SignedOutAuthObject | User,
) {
  const stripeId = getStripeId(user);
  if (!stripeId) return;
  return Stripe.getActiveSubscriptions(stripeId);
}

export function getPrimaryEmailAddress(user: User) {
  return user.emailAddresses.find(
    (email) => email.id === user.primaryEmailAddressId,
  )?.emailAddress;
}

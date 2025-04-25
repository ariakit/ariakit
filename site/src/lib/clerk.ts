import type { User, clerkClient } from "@clerk/astro/server";
import { createCustomerWithClerkUser } from "./stripe.ts";

export type { User };

export type ClerkClient = ReturnType<typeof clerkClient>;

export function isClerkEnabled() {
  return !!import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY;
}

export function getStripeId(user?: User) {
  if (!user) return;
  return user.publicMetadata.stripeId as string | undefined;
}

export async function createCustomerIfNeeded(clerk: ClerkClient, user: User) {
  const stripeId = getStripeId(user);
  if (stripeId) return stripeId;
  const customer = await createCustomerWithClerkUser(clerk, user);
  return customer?.id;
}

export async function updateUserWithStripeId(
  clerk: ClerkClient,
  userId: string,
  stripeId: string,
) {
  if (!clerk) return null;
  const user = await clerk.users.updateUser(userId, {
    publicMetadata: { stripeId },
  });
  return user;
}

export function getPrimaryEmailAddress(user?: User | null) {
  if (!user) return;
  return user.emailAddresses.find(
    (email) => email.id === user.primaryEmailAddressId,
  )?.emailAddress;
}

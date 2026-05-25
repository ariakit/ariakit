import { clerkClient, currentUser, type User } from "@clerk/nextjs/server";
import type { UserResource } from "@clerk/nextjs/types";

export type { User, UserResource };

export async function getClerkClient() {
  if (!process.env.CLERK_SECRET_KEY) return null;
  return clerkClient();
}

export async function getCurrentUser() {
  if (!process.env.CLERK_SECRET_KEY) return null;
  return currentUser();
}

export function getStripeId(user?: User | UserResource | null) {
  if (!user) return;
  return user.publicMetadata.stripeId as string | undefined;
}

export async function updateUserWithStripeId(userId: string, stripeId: string) {
  const clerk = await getClerkClient();
  if (!clerk) return null;
  return clerk.users.updateUser(userId, {
    publicMetadata: { stripeId },
  });
}

export function getPrimaryEmailAddress(user?: User | UserResource | null) {
  if (!user) return;
  return user.emailAddresses.find(
    (email) => email.id === user.primaryEmailAddressId,
  )?.emailAddress;
}

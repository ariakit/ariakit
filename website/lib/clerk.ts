import type { User } from "@clerk/clerk-sdk-node";
import { clerkClient, currentUser } from "@clerk/nextjs";
import type { UserResource } from "@clerk/types";

const clerk = process.env.CLERK_SECRET_KEY ? clerkClient : null;

export type { User, UserResource };

export function getClerkClient() {
  return clerk;
}

export async function getCurrentUser() {
  if (!clerk) return null;
  return currentUser();
}

export function getStripeId(user?: User | UserResource | null) {
  if (!user) return;
  return user.publicMetadata.stripeId as string | undefined;
}

export async function updateUserWithStripeId(userId: string, stripeId: string) {
  if (!clerk) return null;
  const user = await clerk.users.updateUser(userId, {
    publicMetadata: { stripeId },
  });
  return user;
}

export function getPrimaryEmailAddress(user?: User | UserResource | null) {
  if (!user) return;
  return user.emailAddresses.find(
    (email) => email.id === user.primaryEmailAddressId,
  )?.emailAddress;
}

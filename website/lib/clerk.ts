import type { User } from "@clerk/backend";
import { clerkClient, currentUser } from "@clerk/nextjs/server";
import type { UserResource } from "@clerk/shared/types";

const enabled = !!process.env.CLERK_SECRET_KEY;

export type { User, UserResource };

export async function getClerkClient() {
  if (!enabled) return null;
  return clerkClient();
}

export async function getCurrentUser() {
  if (!enabled) return null;
  return currentUser();
}

export function getStripeId(user?: User | UserResource | null) {
  if (!user) return;
  return user.publicMetadata.stripeId as string | undefined;
}

export async function updateUserWithStripeId(userId: string, stripeId: string) {
  const clerk = await getClerkClient();
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

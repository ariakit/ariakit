import { clerkClient } from "@clerk/nextjs/api";
import type { User } from "@clerk/nextjs/api";

const clerk = process.env.CLERK_SECRET_KEY ? clerkClient : null;

export function getClerkClient() {
  return clerk;
}

export function getStripeId(user?: User | null) {
  if (!clerk) return;
  if (!user) return;
  return user.publicMetadata.stripeId as string | undefined;
}

export async function updateUserWithStripeId(userId: string, stripeId: string) {
  if (!clerk) return;
  const user = await clerk.users.updateUser(userId, {
    publicMetadata: { stripeId },
  });
  return user;
}

export function getPrimaryEmailAddress(user: User) {
  return user.emailAddresses.find(
    (email) => email.id === user.primaryEmailAddressId,
  )?.emailAddress;
}

import { type User, clerkClient } from "@clerk/astro/server";
import type { APIContext } from "astro";
import { createLogger } from "./logger.ts";
import type { PlusType } from "./schemas.ts";

const logger = createLogger("clerk");

export type { User };

export function isClerkEnabled() {
  return !!import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY;
}

export function setCurrentUser(context: APIContext, user: User | null) {
  context.locals.user = user;
}

export interface GetUserParams {
  context: APIContext;
  user?: User | string | null;
}

export async function getUser({ context, user }: GetUserParams) {
  if (!isClerkEnabled()) return null;
  if (!user) return getCurrentUser(context);
  if (typeof user === "string") {
    const clerk = clerkClient(context);
    return clerk.users.getUser(user);
  }
  return user;
}

export interface GetCustomerParams {
  context: APIContext;
  user?: User | string | null;
}

export async function getCustomer(params: GetCustomerParams) {
  if (!isClerkEnabled()) return null;
  const user = await getUser(params);
  if (!user) return null;
  return user.privateMetadata.stripeId || null;
}
export interface UserHasTeamParams {
  context: APIContext;
  user?: User | string | null;
}

export async function userHasTeam(params: UserHasTeamParams) {
  if (!isClerkEnabled()) return false;
  const user = await getUser(params);
  if (!user) return false;
  const clerk = clerkClient(params.context);
  const memberships = await clerk.users.getOrganizationMembershipList({
    userId: user.id,
    limit: 1,
  });
  return !!memberships.data.length;
}

export interface GetUserPlusParams {
  context: APIContext;
  user?: User | string | null;
}

export async function getUserPlus(params: GetUserPlusParams) {
  if (!isClerkEnabled()) return null;
  const user = await getUser(params);
  if (!user) return null;
  return user.privateMetadata.plus || null;
}

export interface UserHasPlusParams {
  context: APIContext;
  user?: User | string | null;
}

export async function userHasPlus(params: UserHasPlusParams) {
  if (!isClerkEnabled()) return false;
  const user = await getUser(params);
  if (!user) return false;
  return !!user.privateMetadata.plus || (await userHasTeam(params));
}

export interface AddPlusToUserParams {
  context: APIContext;
  type: PlusType;
  user?: User | string | null;
  amount?: number;
  currency?: string;
}

export async function addPlusToUser(params: AddPlusToUserParams) {
  if (!isClerkEnabled()) return;
  const user = await getUser(params);
  if (!user) return;
  const { info } = logger.start();
  const clerk = clerkClient(params.context);
  const isTeam = params.type === "team";
  await clerk.users.updateUser(user.id, {
    createOrganizationEnabled: isTeam,
    createOrganizationsLimit: isTeam ? 1 : undefined,
    privateMetadata: {
      plus: params.type,
      credit: isTeam ? 0 : params.amount,
      currency: params.currency,
    },
  });
  info("Added plus %s to user %s", params.type, user.id);
}

export interface RemovePlusFromUserParams {
  context: APIContext;
  user?: User | string | null;
}

export async function removePlusFromUser(params: RemovePlusFromUserParams) {
  if (!isClerkEnabled()) return;
  const user = await getUser(params);
  if (!user) return;
  const { info } = logger.start();
  const clerk = clerkClient(params.context);
  await clerk.users.updateUser(user.id, {
    createOrganizationEnabled: false,
    privateMetadata: {
      plus: null,
      credit: 0,
      currency: null,
    },
  });
  info("Removed plus from user", user.id);
}

export async function getCurrentUser(context: APIContext) {
  if (!isClerkEnabled()) return null;
  if (context.locals.user) return context.locals.user;
  const user = await context.locals.currentUser();
  setCurrentUser(context, user);
  return user;
}

export async function getCurrentCustomer(context: APIContext) {
  if (!isClerkEnabled()) return null;
  const user = await getCurrentUser(context);
  if (!user) return null;
  return getCustomer({ context, user });
}

export async function updateUserPrivateMetadata(
  context: APIContext,
  userId: string,
  privateMetadata: UserPrivateMetadata,
) {
  if (!isClerkEnabled()) return;
  const clerk = clerkClient(context);
  const { info } = logger.start();
  const user = await clerk.users.updateUserMetadata(userId, {
    privateMetadata,
  });
  info("Updated private metadata for", userId);
  setCurrentUser(context, user);
}

export interface GetAllUsersParams {
  context: APIContext;
  limit?: number;
  offset?: number;
}

export async function getAllUsers({
  context,
  limit = 100,
  offset = 0,
}: GetAllUsersParams) {
  if (!isClerkEnabled()) return [];
  const clerk = clerkClient(context);
  const allUsers: User[] = [];
  let hasMore = false;
  do {
    const users = await clerk.users.getUserList({
      limit: 100,
      offset: offset,
      orderBy: "+created_at",
    });
    if (users.data.length === 0) break;
    allUsers.push(...users.data);
    offset += users.data.length;
    hasMore = users.data.length === limit;
  } while (hasMore);
  return allUsers;
}

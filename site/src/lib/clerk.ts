import { type User, clerkClient } from "@clerk/astro/server";
import type { APIContext } from "astro";
import { createLogger } from "./logger.ts";
import { objectId } from "./object-id.ts";
import type { PlusType } from "./schemas.ts";

const logger = createLogger("clerk");

export type { User };

export function isClerkEnabled() {
  return !!import.meta.env.PUBLIC_CLERK_PUBLISHABLE_KEY;
}

export function getCurrentUserId(context: APIContext) {
  return context.locals.auth().userId;
}

export function setCurrentUser(context: APIContext, user: User | null) {
  context.locals.user = user;
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

export function currentUserHasTeam(context: APIContext) {
  if (!isClerkEnabled()) return false;
  const { orgId } = context.locals.auth();
  return orgId != null;
}

export function getCurrentUserPlus(context: APIContext) {
  if (!isClerkEnabled()) return null;
  const { sessionClaims } = context.locals.auth();
  return sessionClaims?.publicMetadata.plus || null;
}

export interface GetUserIdParams {
  context: APIContext;
  user?: User | string | null;
}

export async function getUserId({ context, user }: GetUserIdParams) {
  if (!isClerkEnabled()) return null;
  if (!user) return getCurrentUserId(context);
  return objectId(user);
}

export interface GetUserParams {
  context: APIContext;
  user?: User | string | null;
}

export async function getUser({ context, user }: GetUserParams) {
  if (!isClerkEnabled()) return null;
  if (!user) return getCurrentUser(context);
  if (typeof user !== "string") return user;
  const clerk = clerkClient(context);
  return clerk.users.getUser(user);
}

export interface GetUserPlusParams {
  context: APIContext;
  user?: User | string | null;
}

export async function getUserPlus({ context, user }: GetUserPlusParams) {
  if (!isClerkEnabled()) return null;
  if (!user) return getCurrentUserPlus(context);
  user = await getUser({ context, user });
  if (!user) return null;
  return user.publicMetadata.plus || null;
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

export async function setCustomer(
  context: APIContext,
  userId: string,
  stripeId: string,
) {
  if (!isClerkEnabled()) return;
  const clerk = clerkClient(context);
  const { info } = logger.start();
  const user = await clerk.users.updateUserMetadata(userId, {
    privateMetadata: { stripeId },
  });
  info("Updated private metadata for", userId);
  setCurrentUser(context, user);
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
  const userId = await getUserId(params);
  if (!userId) return;
  const { info } = logger.start();
  const clerk = clerkClient(params.context);
  const isTeam = params.type === "team";
  await clerk.users.updateUser(userId, {
    createOrganizationEnabled: isTeam,
    createOrganizationsLimit: isTeam ? 1 : undefined,
    publicMetadata: { plus: params.type },
    privateMetadata: {
      credit: isTeam ? 0 : params.amount,
      currency: params.currency,
    },
  });
  info("Added plus %s to user %s", params.type, userId);
}

export interface RemovePlusFromUserParams {
  context: APIContext;
  user?: User | string | null;
}

export async function removePlusFromUser(params: RemovePlusFromUserParams) {
  if (!isClerkEnabled()) return;
  const userId = await getUserId(params);
  if (!userId) return;
  const { info } = logger.start();
  const clerk = clerkClient(params.context);
  await clerk.users.updateUser(userId, {
    createOrganizationEnabled: false,
    publicMetadata: { plus: null },
    privateMetadata: { credit: 0, currency: null },
  });
  info("Removed plus from user", userId);
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

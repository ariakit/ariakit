/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */
import type { User } from "@clerk/astro/server";
import { clerkClient } from "@clerk/astro/server";
import type { APIContext } from "astro";
import { createLogger } from "./logger.ts";
import { objectId } from "./object.ts";
import type { PlusType } from "./schemas.ts";

const logger = createLogger("clerk");

export type { User };

type ClerkEnv = Pick<Cloudflare.Env, "PUBLIC_CLERK_PUBLISHABLE_KEY">;

export function isClerkEnabled(env: ClerkEnv) {
  return !!env.PUBLIC_CLERK_PUBLISHABLE_KEY;
}

export function getCurrentUserId(context: APIContext, env: ClerkEnv) {
  if (!isClerkEnabled(env)) return null;
  return context.locals.auth().userId;
}

export function isSignedIn(context: APIContext, env: ClerkEnv) {
  return !!getCurrentUserId(context, env);
}

export function setCurrentUser(context: APIContext, user: User | null) {
  context.locals.user = user;
}

export async function getCurrentUser(context: APIContext, env: ClerkEnv) {
  if (!isClerkEnabled(env)) return null;
  if (context.locals.user) return context.locals.user;
  const user = await context.locals.currentUser();
  setCurrentUser(context, user);
  return user;
}

export async function getCurrentCustomer(context: APIContext, env: ClerkEnv) {
  if (!isClerkEnabled(env)) return null;
  const user = await getCurrentUser(context, env);
  if (!user) return null;
  return getCustomer({ context, env, user });
}

export async function getCurrentUserTeams(
  context: APIContext,
  env: ClerkEnv,
  refresh = false,
) {
  if (!isClerkEnabled(env)) return new Map<string, string>();
  if (refresh) {
    const clerk = clerkClient(context);
    const { userId } = context.locals.auth();
    if (!userId) return new Map<string, string>();
    const teams = await clerk.users.getOrganizationMembershipList({
      userId,
      limit: 100,
    });
    return new Map(teams.data.map((t) => [t.organization.id, t.role]));
  }
  const { sessionClaims } = context.locals.auth();
  return new Map(Object.entries(sessionClaims?.teams ?? {}));
}

export async function getCurrentUserPlus(
  context: APIContext,
  env: ClerkEnv,
  refresh = false,
) {
  if (!isClerkEnabled(env)) return null;
  const { sessionClaims } = context.locals.auth();
  let publicMetadata = sessionClaims?.publicMetadata;
  if (refresh) {
    const user = await getCurrentUser(context, env);
    if (!user) return null;
    publicMetadata = user.publicMetadata;
  }
  if (publicMetadata?.plus) {
    return publicMetadata.plus;
  }
  const teams = await getCurrentUserTeams(context, env, refresh);
  if (teams.size === 0) return null;
  return "team";
}

export interface GetUserIdParams {
  context: APIContext;
  env: ClerkEnv;
  user?: User | string | null;
}

export async function getUserId({ context, env, user }: GetUserIdParams) {
  if (!isClerkEnabled(env)) return null;
  if (!user) return getCurrentUserId(context, env);
  return objectId(user);
}

export interface GetUserParams {
  context: APIContext;
  env: ClerkEnv;
  user?: User | string | null;
}

export async function getUser({ context, env, user }: GetUserParams) {
  if (!isClerkEnabled(env)) return null;
  if (!user) return getCurrentUser(context, env);
  if (typeof user !== "string") return user;
  const clerk = clerkClient(context);
  return clerk.users.getUser(user);
}

export interface GetUserPlusParams {
  context: APIContext;
  env: ClerkEnv;
  user?: User | string | null;
}

export async function getUserPlus({ context, env, user }: GetUserPlusParams) {
  if (!isClerkEnabled(env)) return null;
  if (!user) return getCurrentUserPlus(context, env);
  user = await getUser({ context, env, user });
  if (!user) return null;
  return user.publicMetadata.plus || null;
}

export interface GetCustomerParams {
  context: APIContext;
  env: ClerkEnv;
  user?: User | string | null;
}

export async function getCustomer(params: GetCustomerParams) {
  if (!isClerkEnabled(params.env)) return null;
  const user = await getUser(params);
  if (!user) return null;
  return user.privateMetadata.stripeId || null;
}

export async function setCustomer(
  context: APIContext,
  env: ClerkEnv,
  userId: string,
  stripeId: string,
) {
  if (!isClerkEnabled(env)) return;
  const clerk = clerkClient(context);
  const { info } = logger.start();
  const user = await clerk.users.updateUserMetadata(userId, {
    privateMetadata: { stripeId },
  });
  info("Updated private metadata for", userId);
  setCurrentUser(context, user);
}

export interface CreateTeamParams {
  context: APIContext;
  env: ClerkEnv;
  name?: string;
  user?: User | string | null;
}

export async function createTeam(params: CreateTeamParams) {
  if (!isClerkEnabled(params.env)) return;
  const clerk = clerkClient(params.context);
  const { info } = logger.start();
  const user = await getUser(params);
  if (!user) return;
  const userName =
    user.firstName ?? user.primaryEmailAddress?.emailAddress.split("@")[0];
  const name = params.name ?? `${userName} Team`;
  const team = await clerk.organizations.createOrganization({
    name,
    createdBy: user.id,
    maxAllowedMemberships: 10,
  });
  info("Created team %s", name);
  return team;
}

export interface AddPlusToUserParams {
  context: APIContext;
  env: ClerkEnv;
  type: PlusType;
  user?: User | string | null;
  amount?: number;
  currency?: string;
}

export async function addPlusToUser(params: AddPlusToUserParams) {
  if (!isClerkEnabled(params.env)) return;
  const userId = await getUserId(params);
  if (!userId) return;
  const { info } = logger.start();
  const clerk = clerkClient(params.context);
  const isTeam = params.type === "team";
  await clerk.users.updateUserMetadata(userId, {
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
  env: ClerkEnv;
  user?: User | string | null;
}

export async function removePlusFromUser(params: RemovePlusFromUserParams) {
  if (!isClerkEnabled(params.env)) return;
  const userId = await getUserId(params);
  if (!userId) return;
  const { info } = logger.start();
  const clerk = clerkClient(params.context);
  await clerk.users.updateUserMetadata(userId, {
    publicMetadata: { plus: null },
    privateMetadata: { credit: 0, currency: null },
  });
  info("Removed plus from user", userId);
}

export async function isAdmin(
  context: APIContext,
  env: Pick<Cloudflare.Env, "ADMIN_ORG_ID" | "PUBLIC_CLERK_PUBLISHABLE_KEY">,
) {
  if (!isClerkEnabled(env)) return false;
  const orgId = env.ADMIN_ORG_ID;
  if (!orgId) return false;
  const teams = await getCurrentUserTeams(context, env);
  const orgRole = teams.get(orgId);
  return orgRole === "org:admin";
}

export interface GetAllUsersParams {
  context: APIContext;
  env: ClerkEnv;
  limit?: number;
  offset?: number;
}

export async function getAllUsers({
  context,
  env,
  limit = 100,
  offset = 0,
}: GetAllUsersParams) {
  if (!isClerkEnabled(env)) return [];
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

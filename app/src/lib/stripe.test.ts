/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

import type { APIContext } from "astro";
import type Stripe from "stripe";
import { beforeEach, expect, test, vi } from "vitest";

interface UserFixture {
  id: string;
  firstName: string | null;
  primaryEmailAddress: { emailAddress: string } | null;
  publicMetadata: Record<string, unknown>;
  privateMetadata: Record<string, unknown>;
}

interface OrganizationFixture {
  id: string;
  name: string;
  slug?: string;
  privateMetadata: { stripeCheckoutSessionId?: string };
}

interface MembershipFixture {
  organization: OrganizationFixture;
  role: string;
}

interface ProcessCheckoutParamsFixture {
  context: APIContext;
  session: Stripe.Checkout.Session | string;
}

interface StripeModuleFixture {
  processCheckout(
    params: ProcessCheckoutParamsFixture,
  ): Promise<Stripe.Checkout.Session | void>;
}

interface CreateTeamParamsFixture {
  context: APIContext;
  checkoutSession?: string;
  name?: string;
  user?: UserFixture | string | null;
}

interface AuthModuleFixture {
  createTeam(
    params: CreateTeamParamsFixture,
  ): Promise<OrganizationFixture | void>;
}

const eventStore = vi.hoisted(() => new Map<string, string>());

const clerk = vi.hoisted(() => {
  const users = new Map<string, UserFixture>();
  const memberships = new Map<string, MembershipFixture[]>();
  const organizations = new Map<string, OrganizationFixture>();
  const getOrganizationMembershipList = async ({
    userId,
  }: {
    userId: string;
  }) => ({
    data: memberships.get(userId) ?? [],
  });
  const getOrganization = async ({ slug }: { slug: string }) => {
    const organization = organizations.get(slug);
    if (!organization) throw new Error("Organization not found");
    return organization;
  };
  const createOrganization = async ({
    createdBy,
    name,
    slug,
    privateMetadata = {},
  }: {
    createdBy: string;
    name: string;
    slug?: string;
    privateMetadata?: OrganizationFixture["privateMetadata"];
  }) => {
    if (slug && organizations.has(slug)) {
      throw new Error("Organization slug already exists");
    }
    const organization = {
      id: `org_${memberships.size + 1}`,
      name,
      slug,
      privateMetadata,
    };
    if (slug) {
      organizations.set(slug, organization);
    }
    const userMemberships = memberships.get(createdBy) ?? [];
    userMemberships.push({ organization, role: "org:admin" });
    memberships.set(createdBy, userMemberships);
    return organization;
  };

  return {
    users,
    memberships,
    organizations,
    getOrganizationMembershipList,
    getOrganization,
    createOrganization,
    getUser: vi.fn(async (userId: string) => users.get(userId) ?? null),
    updateUserMetadata: vi.fn(),
    getOrganizationMembershipListMock: vi.fn(getOrganizationMembershipList),
    getOrganizationMock: vi.fn(getOrganization),
    createOrganizationMock: vi.fn(createOrganization),
  };
});

vi.mock("./kv.ts", () => ({
  getBestPromo: vi.fn(),
  getPrices: vi.fn(),
  isEventProcessed: vi.fn(async (key: string) => eventStore.has(key)),
  processEvent: vi.fn(async (key: string) => {
    eventStore.set(key, "processed");
  }),
  putPromo: vi.fn(),
}));

vi.mock("@clerk/astro/server", () => ({
  clerkClient: vi.fn(() => ({
    users: {
      getUser: clerk.getUser,
      updateUserMetadata: clerk.updateUserMetadata,
      getOrganizationMembershipList: clerk.getOrganizationMembershipListMock,
    },
    organizations: {
      getOrganization: clerk.getOrganizationMock,
      createOrganization: clerk.createOrganizationMock,
    },
  })),
}));

vi.mock("./logger.ts", () => {
  const logger = {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  };
  return {
    createLogger: vi.fn(() => ({
      ...logger,
      start: vi.fn(() => logger),
      since: vi.fn(() => logger),
    })),
  };
});

function createUserFixture(userId = "user_checkout"): UserFixture {
  return {
    id: userId,
    firstName: "Checkout",
    primaryEmailAddress: { emailAddress: "checkout@example.com" },
    publicMetadata: {},
    privateMetadata: {},
  };
}

function createCheckoutSession(
  overrides: Partial<Stripe.Checkout.Session> = {},
) {
  return {
    id: "cs_checkout",
    payment_status: "paid",
    metadata: {
      clerkId: "user_checkout",
      plusType: "team",
      creditUsed: "0",
    },
    amount_total: 9900,
    currency: "usd",
    ...overrides,
  } as Stripe.Checkout.Session;
}

function deferred() {
  let resolve = () => {};
  const promise = new Promise<void>((next) => {
    resolve = next;
  });
  return { promise, resolve };
}

async function importStripeModule() {
  vi.resetModules();
  vi.stubEnv("PUBLIC_CLERK_PUBLISHABLE_KEY", "pk_test_checkout");
  vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_checkout");
  const path: string = "./stripe.ts";
  return import(path) as Promise<StripeModuleFixture>;
}

async function importAuthModule() {
  vi.resetModules();
  vi.stubEnv("PUBLIC_CLERK_PUBLISHABLE_KEY", "pk_test_checkout");
  const path: string = "./auth.ts";
  return import(path) as Promise<AuthModuleFixture>;
}

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
  clerk.getOrganizationMembershipListMock.mockImplementation(
    clerk.getOrganizationMembershipList,
  );
  clerk.getOrganizationMock.mockImplementation(clerk.getOrganization);
  clerk.createOrganizationMock.mockImplementation(clerk.createOrganization);
  eventStore.clear();
  clerk.users.clear();
  clerk.memberships.clear();
  clerk.organizations.clear();
  clerk.users.set("user_checkout", createUserFixture());
});

test("keeps failed team checkout fulfillment retryable", async () => {
  const stripeModule = await importStripeModule();
  const session = createCheckoutSession();
  const context = {} as APIContext;

  clerk.createOrganizationMock.mockRejectedValueOnce(
    new Error("Clerk failure"),
  );

  await expect(
    stripeModule.processCheckout({ context, session }),
  ).rejects.toThrow("Clerk failure");

  expect(eventStore.get(session.id)).toBeUndefined();

  await expect(
    stripeModule.processCheckout({ context, session }),
  ).resolves.toBe(session);

  expect(clerk.createOrganizationMock).toHaveBeenCalledTimes(2);
  expect(eventStore.get(session.id)).toBe("processed");
});

test("keeps personal Plus until credited team checkout creates a team", async () => {
  const stripeModule = await importStripeModule();
  const session = createCheckoutSession({
    metadata: {
      clerkId: "user_checkout",
      plusType: "team",
      creditUsed: "9900",
    },
  });
  const context = {} as APIContext;

  clerk.createOrganizationMock.mockRejectedValueOnce(
    new Error("Clerk failure"),
  );

  await expect(
    stripeModule.processCheckout({ context, session }),
  ).rejects.toThrow("Clerk failure");

  expect(clerk.updateUserMetadata).not.toHaveBeenCalled();
  expect(eventStore.get(session.id)).toBeUndefined();

  await expect(
    stripeModule.processCheckout({ context, session }),
  ).resolves.toBe(session);

  expect(clerk.createOrganizationMock).toHaveBeenCalledTimes(2);
  expect(clerk.updateUserMetadata).toHaveBeenCalledOnce();
  expect(eventStore.get(session.id)).toBe("processed");
});

test("reuses a checkout-created team when credit cleanup retries", async () => {
  const stripeModule = await importStripeModule();
  const session = createCheckoutSession({
    metadata: {
      clerkId: "user_checkout",
      plusType: "team",
      creditUsed: "9900",
    },
  });
  const context = {} as APIContext;

  clerk.updateUserMetadata.mockRejectedValueOnce(new Error("Clerk failure"));

  await expect(
    stripeModule.processCheckout({ context, session }),
  ).rejects.toThrow("Clerk failure");

  expect(clerk.createOrganizationMock).toHaveBeenCalledOnce();
  expect(eventStore.get(session.id)).toBeUndefined();

  await expect(
    stripeModule.processCheckout({ context, session }),
  ).resolves.toBe(session);

  expect(clerk.createOrganizationMock).toHaveBeenCalledOnce();
  expect(clerk.updateUserMetadata).toHaveBeenCalledTimes(2);
  expect(eventStore.get(session.id)).toBe("processed");
});

test("keeps failed personal checkout fulfillment retryable", async () => {
  const stripeModule = await importStripeModule();
  const session = createCheckoutSession({
    metadata: {
      clerkId: "user_checkout",
      plusType: "personal",
      creditUsed: "0",
    },
  });
  const context = {} as APIContext;

  clerk.updateUserMetadata.mockRejectedValueOnce(new Error("Clerk failure"));

  await expect(
    stripeModule.processCheckout({ context, session }),
  ).rejects.toThrow("Clerk failure");

  expect(eventStore.get(session.id)).toBeUndefined();

  await expect(
    stripeModule.processCheckout({ context, session }),
  ).resolves.toBe(session);

  expect(clerk.updateUserMetadata).toHaveBeenCalledTimes(2);
  expect(eventStore.get(session.id)).toBe("processed");
});

test("reuses a team created by the same checkout", async () => {
  const stripeModule = await importStripeModule();
  const session = createCheckoutSession();
  const context = {} as APIContext;
  const existingTeam = {
    id: "org_checkout",
    name: "Existing Checkout Team",
    privateMetadata: { stripeCheckoutSessionId: session.id },
  };

  clerk.memberships.set("user_checkout", [
    { organization: existingTeam, role: "org:admin" },
  ]);

  await expect(
    stripeModule.processCheckout({ context, session }),
  ).resolves.toBe(session);

  expect(clerk.createOrganizationMock).not.toHaveBeenCalled();
  expect(eventStore.get(session.id)).toBe("processed");
});

test("reuses a concurrently-created team for the same checkout", async () => {
  const stripeModule = await importStripeModule();
  const session = createCheckoutSession();
  const context = {} as APIContext;
  const firstCreateStarted = deferred();
  const releaseFirstCreate = deferred();

  clerk.getOrganizationMembershipListMock.mockResolvedValue({ data: [] });
  clerk.createOrganizationMock.mockImplementationOnce(async (params) => {
    const organization = await clerk.createOrganization(params);
    firstCreateStarted.resolve();
    await releaseFirstCreate.promise;
    return organization;
  });

  const firstCheckout = stripeModule.processCheckout({ context, session });
  await firstCreateStarted.promise;
  const secondCheckout = stripeModule.processCheckout({ context, session });
  await secondCheckout;

  releaseFirstCreate.resolve();
  await firstCheckout;

  expect(clerk.createOrganizationMock).toHaveBeenCalledTimes(2);
  expect(clerk.memberships.get("user_checkout")).toHaveLength(1);
  expect(eventStore.get(session.id)).toBe("processed");
});

test("reuses an existing team created by the same checkout", async () => {
  const authModule = await importAuthModule();
  const context = {} as APIContext;
  const existingTeam = {
    id: "org_checkout",
    name: "Existing Checkout Team",
    privateMetadata: { stripeCheckoutSessionId: "cs_checkout" },
  };

  clerk.memberships.set("user_checkout", [
    { organization: existingTeam, role: "org:admin" },
  ]);

  await expect(
    authModule.createTeam({
      context,
      user: "user_checkout",
      checkoutSession: "cs_checkout",
    }),
  ).resolves.toBe(existingTeam);

  expect(clerk.createOrganizationMock).not.toHaveBeenCalled();
});

test("creates a new team for a different checkout", async () => {
  const authModule = await importAuthModule();
  const context = {} as APIContext;
  const existingTeam = {
    id: "org_checkout",
    name: "Existing Checkout Team",
    privateMetadata: { stripeCheckoutSessionId: "cs_previous" },
  };

  clerk.memberships.set("user_checkout", [
    { organization: existingTeam, role: "org:admin" },
  ]);

  await expect(
    authModule.createTeam({
      context,
      user: "user_checkout",
      checkoutSession: "cs_checkout",
    }),
  ).resolves.toMatchObject({
    privateMetadata: { stripeCheckoutSessionId: "cs_checkout" },
  });

  expect(clerk.createOrganizationMock).toHaveBeenCalledOnce();
});

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
}

interface MembershipFixture {
  organization: OrganizationFixture;
  role: string;
}

const eventStore = vi.hoisted(() => new Map<string, string>());

const clerk = vi.hoisted(() => {
  const users = new Map<string, UserFixture>();
  const memberships = new Map<string, MembershipFixture[]>();

  return {
    users,
    memberships,
    getUser: vi.fn(async (userId: string) => users.get(userId) ?? null),
    updateUserMetadata: vi.fn(),
    getOrganizationMembershipList: vi.fn(
      async ({ userId }: { userId: string }) => ({
        data: memberships.get(userId) ?? [],
      }),
    ),
    createOrganization: vi.fn(
      async ({ createdBy, name }: { createdBy: string; name: string }) => {
        const organization = {
          id: `org_${memberships.size + 1}`,
          name,
        };
        const userMemberships = memberships.get(createdBy) ?? [];
        userMemberships.push({ organization, role: "org:admin" });
        memberships.set(createdBy, userMemberships);
        return organization;
      },
    ),
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
      getOrganizationMembershipList: clerk.getOrganizationMembershipList,
    },
    organizations: {
      createOrganization: clerk.createOrganization,
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

function createUserFixture(userId = "user_t088"): UserFixture {
  return {
    id: userId,
    firstName: "T088",
    primaryEmailAddress: { emailAddress: "t088@example.com" },
    publicMetadata: {},
    privateMetadata: {},
  };
}

function createCheckoutSession(
  overrides: Partial<Stripe.Checkout.Session> = {},
) {
  return {
    id: "cs_t088",
    payment_status: "paid",
    metadata: {
      clerkId: "user_t088",
      plusType: "team",
      creditUsed: "0",
    },
    amount_total: 9900,
    currency: "usd",
    ...overrides,
  } as Stripe.Checkout.Session;
}

async function importStripeModule() {
  vi.resetModules();
  vi.stubEnv("PUBLIC_CLERK_PUBLISHABLE_KEY", "pk_test_t088");
  vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_t088");
  return import("./stripe.ts");
}

beforeEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
  eventStore.clear();
  clerk.users.clear();
  clerk.memberships.clear();
  clerk.users.set("user_t088", createUserFixture());
});

test("T088 keeps failed team checkout fulfillment retryable", async () => {
  const { processCheckout } = await importStripeModule();
  const session = createCheckoutSession();
  const context = {} as APIContext;

  clerk.createOrganization.mockRejectedValueOnce(new Error("Clerk failure"));

  await expect(processCheckout({ context, session })).rejects.toThrow(
    "Clerk failure",
  );

  expect(eventStore.get(session.id)).toBeUndefined();
});

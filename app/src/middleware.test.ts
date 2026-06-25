/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

import type { APIContext, MiddlewareNext } from "astro";
import { afterEach, expect, test, vi } from "vitest";

const { clerkMiddlewareMock, getActionContextMock, isAdminMock } = vi.hoisted(
  () => ({
    clerkMiddlewareMock: vi.fn(),
    getActionContextMock: vi.fn(),
    isAdminMock: vi.fn(),
  }),
);

vi.mock("@clerk/astro/server", () => ({
  clerkMiddleware: clerkMiddlewareMock,
}));

vi.mock("astro:actions", () => ({
  getActionContext: getActionContextMock,
}));

vi.mock("./lib/auth.ts", () => ({
  isAdmin: isAdminMock,
}));

import { onRequest } from "./middleware.ts";

afterEach(() => {
  vi.unstubAllEnvs();
  vi.clearAllMocks();
});

test("blocks admin actions before the action handler runs", async () => {
  vi.stubEnv("PUBLIC_CLERK_PUBLISHABLE_KEY", "test_clerk_key");
  getActionContextMock.mockReturnValue({
    action: { name: "admin.sync" },
  });
  isAdminMock.mockResolvedValue(false);
  clerkMiddlewareMock.mockReturnValue(
    async (context: APIContext, next: MiddlewareNext) => {
      context.locals.auth = vi.fn();
      return next();
    },
  );
  const next = vi.fn(async () => new Response("Action ran"));
  const context = { locals: {} } as APIContext;

  const response = await onRequest(context, next);
  if (!response) {
    throw new Error("Expected middleware response");
  }

  expect(response.status).toBe(401);
  expect(await response.text()).toBe("Unauthorized");
  expect(isAdminMock).toHaveBeenCalledWith(context);
  expect(next).not.toHaveBeenCalled();
});

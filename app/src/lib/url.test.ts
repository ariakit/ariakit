/**
 * @license
 * Copyright 2025-present Ariakit FZ-LLC. All Rights Reserved.
 *
 * This software is proprietary. See the license.md file in the root of this
 * package for licensing terms.
 *
 * SPDX-License-Identifier: UNLICENSED
 */

import { expect, test } from "vitest";
import { URLSchema } from "./schemas.ts";
import { getPlusAccountPath, getPlusCheckoutPath } from "./url.ts";

test.each([
  ["javascript:alert(1)", undefined],
  ["data:text/html,<script>alert(1)</script>", undefined],
  ["https://evil.com/account?tab=billing#team", "/account?tab=billing#team"],
  ["//evil.com/account?tab=billing#team", "/account?tab=billing#team"],
  ["https://evil.com//account?tab=billing#team", "/account?tab=billing#team"],
  ["https://evil.com/%5C%5Caccount", "/account"],
  ["https://evil.com/foo/..//account", "/account"],
  ["/\\evil.com", "/"],
  ["/%09/evil.com", "/"],
  ["/docs?section=plus#pricing", "/docs?section=plus#pricing"],
  ["docs?section=plus#pricing", "/docs?section=plus#pricing"],
  ["%", undefined],
])("URLSchema normalizes %s", (value, expected) => {
  expect(URLSchema.parse(value)).toBe(expected);
});

test("getPlusCheckoutPath strips redirect URL origins", () => {
  const path = getPlusCheckoutPath({
    redirectUrl: "https://next.ariakit.com/docs?section=plus#pricing",
  });
  const redirectUrl = new URL(path, "http://localhost").searchParams.get(
    "redirect_url",
  );

  expect(URLSchema.parse(redirectUrl)).toBe("/docs?section=plus#pricing");
});

test("getPlusAccountPath strips redirect URL origins", () => {
  const path = getPlusAccountPath({
    redirectUrl: "https://next.ariakit.com/docs?section=plus#pricing",
  });
  const redirectUrl = new URL(path, "http://localhost").searchParams.get(
    "redirect_url",
  );

  expect(URLSchema.parse(redirectUrl)).toBe("/docs?section=plus#pricing");
});

test("getPlusCheckoutPath skips non-http redirect URL schemes", () => {
  const path = getPlusCheckoutPath({
    redirectUrl: "javascript:alert(1)",
  });
  const redirectUrl = new URL(path, "http://localhost").searchParams.get(
    "redirect_url",
  );

  expect(redirectUrl).toBeNull();
});

test("getPlusCheckoutPath strips redirect URL network paths", () => {
  const path = getPlusCheckoutPath({
    redirectUrl: "https://next.ariakit.com//evil.com/docs",
  });
  const redirectUrl = new URL(path, "http://localhost").searchParams.get(
    "redirect_url",
  );

  expect(URLSchema.parse(redirectUrl)).toBe("/evil.com/docs");
});

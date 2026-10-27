import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("reads the error panel before the hint and marks the field invalid", () => {
  const field = q.textbox("Email");
  expect(field).toHaveAttribute("aria-invalid", "true");
  expect(field).toHaveAccessibleDescription(
    "Another account uses this address. Sign in or use a different address. We send a confirmation link to this address.",
  );
  expect(q.link("Sign in")).toHaveAttribute("href", "#sign-in");
});

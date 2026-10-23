import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("reads the error before the hint and marks the field invalid", () => {
  const field = q.textbox("Email");
  expect(field).toHaveAttribute("aria-invalid", "true");
  expect(field).toHaveAccessibleDescription(
    "Enter an email address like ada@example.com. We send a confirmation link to this address.",
  );
});

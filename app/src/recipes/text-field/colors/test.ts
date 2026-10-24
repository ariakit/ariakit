import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("describes each colored field with its text", () => {
  expect(q.textbox("Username")).toHaveAccessibleDescription(
    "The name is available.",
  );
  expect(q.textbox("Recipient")).toHaveAccessibleDescription(
    "This address is outside your team.",
  );
  expect(q.textbox("Shipping address")).toHaveAccessibleDescription(
    "Filled from your last order.",
  );
});

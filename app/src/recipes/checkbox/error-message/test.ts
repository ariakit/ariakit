import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("marks the checkbox as invalid and describes it with the error", () => {
  const terms = q.checkbox("I agree to the terms of service");
  expect(terms).toBeRequired();
  expect(terms).not.toBeChecked();
  expect(terms).toHaveAttribute("aria-invalid", "true");
  expect(terms).toHaveAccessibleDescription(
    "Check the box to create your account.",
  );
});

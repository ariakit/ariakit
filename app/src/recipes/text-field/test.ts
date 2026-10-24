import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("names the field with its label and describes it with the hint", () => {
  const field = q.textbox("Display name");
  expect(field).toHaveValue("Ada Lovelace");
  expect(field).toHaveAccessibleDescription(
    "Shown on your profile and next to your comments.",
  );
  expect(field).not.toHaveAttribute("aria-invalid");
});

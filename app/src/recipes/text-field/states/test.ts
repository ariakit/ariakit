import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("names and describes the field in each state", () => {
  expect(q.textbox("Username")).not.toHaveAccessibleDescription();
  expect(q.textbox("Display name")).toHaveAccessibleDescription(
    "Shown on your profile.",
  );
  expect(q.textbox("Email")).toHaveAccessibleDescription(
    "Enter an email address. Used to sign in.",
  );
  expect(q.textbox("Email")).toHaveAttribute("aria-invalid", "true");
  expect(q.textbox("Workspace")).toBeDisabled();
  expect(q.textbox("Workspace")).toHaveAccessibleDescription(
    "Only owners can rename it.",
  );
});

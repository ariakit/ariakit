import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("names and describes the horizontal fields", () => {
  expect(q.textbox("Full name")).toHaveAccessibleDescription(
    "Used on invoices.",
  );
  expect(q.textbox("Billing email")).toHaveValue("marta@example.com");
  expect(q.textbox("Phone")).toHaveAccessibleDescription(
    "Enter the full number.",
  );
  expect(q.textbox("Phone")).toHaveAttribute("aria-invalid", "true");
});

import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("reads the error panel before the hint on each background", () => {
  expect(q.textbox("Email")).toHaveAttribute("aria-invalid", "true");
  expect(q.textbox("Email")).toHaveAccessibleDescription(
    "Enter an email address. One newsletter a month.",
  );
  expect(q.textbox("Gift message")).toHaveAttribute("aria-invalid", "true");
  expect(q.textbox("Gift message")).toHaveAccessibleDescription(
    "Use 40 characters or fewer. Printed on the card.",
  );
  expect(q.textbox("Project name")).toHaveAttribute("aria-invalid", "true");
  expect(q.textbox("Project name")).toHaveAccessibleDescription(
    "Type analytical-engine. Type the name to confirm.",
  );
});

import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("names and describes the field on each background", () => {
  expect(q.textbox("Email")).toHaveAccessibleDescription(
    "One newsletter a month.",
  );
  expect(q.textbox("Gift message")).toHaveAccessibleDescription(
    "Printed on the card.",
  );
  expect(q.textbox("Project name")).toHaveAccessibleDescription(
    "Type the name to confirm.",
  );
});

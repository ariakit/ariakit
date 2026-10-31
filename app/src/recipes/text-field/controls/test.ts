import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("names and describes a group, a select, and a textarea", () => {
  expect(q.textbox("Website")).toHaveValue("marta.example");
  expect(q.combobox("Country")).toHaveAccessibleDescription(
    "Sets your currency.",
  );
  expect(q.textbox("Bio")).toHaveAccessibleDescription("Up to 160 characters.");
});

test("stops the bio at the length that its hint states", () => {
  expect(q.textbox("Bio")).toHaveAttribute("maxlength", "160");
});

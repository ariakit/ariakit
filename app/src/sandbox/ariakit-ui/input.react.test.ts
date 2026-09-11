import { q } from "@ariakit/test";
import { expect, test } from "vitest";
import { mountExamples } from "./mount.react.test-helper.ts";
import { InputExamples } from "./pages/input.react.tsx";

mountExamples(InputExamples);

test("links each hint and error message to its field", () => {
  const field = q.within(q.article("Labeled field with hint"));
  expect(field.textbox("Display name")).toHaveAccessibleDescription(
    "Shown on your public profile.",
  );

  const invalid = q.within(q.article("Invalid")).textbox("Email");
  expect(invalid).toHaveAttribute("aria-invalid", "true");
  expect(invalid).toHaveAccessibleDescription("Enter a valid email address.");
});

test("names a field from the label around it", () => {
  const field = q.within(q.article("Small")).textbox("Postal code");
  expect(field).not.toHaveAttribute("readonly");
  expect(field).toBeEnabled();
});

test("keeps the key hint out of the search trigger name", () => {
  const box = q.within(q.article("Search trigger"));
  expect(box.button("Search docs")).toBeInTheDocument();
});

test("keeps the share link read-only", () => {
  const input = q
    .within(q.article("Share link with copy button"))
    .textbox("Share link");
  expect(input).toHaveValue("ariakit.com/ui");
  expect(input).toHaveAttribute("readonly");
});

import { press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("skips the disabled segment with the arrow keys", async () => {
  await press.Tab();
  await press.ArrowRight();
  await press.ArrowRight();
  expect(q.radio("Month")).toBeChecked();
  await press.ArrowRight();
  expect(q.radio("Year")).toBeDisabled();
  expect(q.radio("Day")).toBeChecked();
});

test("puts a hidden separator before each segment after the first", () => {
  const card = (name: string) => q.radio(name).closest("label");
  expect(card("Day")?.previousElementSibling).toBeNull();
  for (const name of ["Week", "Month", "Year"]) {
    expect(card(name)?.previousElementSibling).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  }
});

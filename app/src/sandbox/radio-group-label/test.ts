import { q } from "@ariakit/test";
import { expect, test } from "vitest";

test("RadioGroupLabel names the radio group", () => {
  expect(q.radiogroup("Favorite fruit")).toHaveAccessibleName("Favorite fruit");
});

test("aria-label takes precedence over RadioGroupLabel", () => {
  const group = q.radiogroup("Shipping speed");
  expect(group).toHaveAccessibleName("Shipping speed");
  expect(group).not.toHaveAttribute("aria-labelledby");
});

test("RadioGroupLabel names a radio group rendered as a Group", () => {
  expect(q.radiogroup("View")).toHaveAccessibleName("View");
});

test("RadioGroupLabel names a radio group rendered as a useGroup component", () => {
  expect(q.radiogroup("Payment method")).toHaveAccessibleName("Payment method");
});

test("RadioGroupLabel does not rename a parent Group", () => {
  expect(q.group("Notifications")).toHaveAccessibleName("Notifications");
  expect(q.radiogroup("Email frequency")).toHaveAccessibleName(
    "Email frequency",
  );
});

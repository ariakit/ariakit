import { click, press, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

test("shows the field after the checkbox only while it is checked", async () => {
  const gift = q.checkbox("This order is a gift");
  expect(gift).toHaveAccessibleDescription("The receipt leaves out the prices");
  expect(q.textbox.maybe("Gift message")).not.toBeInTheDocument();
  await click(gift);
  expect(q.textbox("Gift message")).toBeVisible();
  // Focus stays on the checkbox, and Tab moves into the field next.
  expect(gift).toHaveFocus();
  await press.Tab();
  expect(q.textbox("Gift message")).toHaveFocus();
  await click(gift);
  expect(q.textbox.maybe("Gift message")).not.toBeInTheDocument();
});

test("keeps the typed message when the box is checked again", async () => {
  const gift = q.checkbox("This order is a gift");
  await click(gift);
  await type("Happy birthday", q.textbox("Gift message"));
  await click(gift);
  await click(gift);
  expect(q.textbox("Gift message")).toHaveValue("Happy birthday");
});

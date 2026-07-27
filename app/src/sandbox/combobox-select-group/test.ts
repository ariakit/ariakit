import { click, hover, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("hover on item", async () => {
  await click(q.combobox("Favorite food"));
  await hover(q.option("Banana"));
  expect(q.option("Banana")).toHaveFocus();
  await hover(q.text("Dairy"));
  expect(q.option("Banana")).not.toHaveFocus();
  expect(q.combobox("Favorite food")).toHaveFocus();
  expect(q.combobox("Favorite food")).not.toHaveAttribute(
    "aria-activedescendant",
  );
  await hover(q.option("Banana"));
  expect(q.option("Banana")).toHaveFocus();
});

// Without the closed-popup gate, the stale active item would be restored and
// the arrow key would move nothing.
test("arrow keys still move after hovering out of the items", async () => {
  await click(q.combobox("Favorite food"));
  await hover(q.option("Banana"));
  await hover(q.text("Dairy"));
  expect(q.combobox("Favorite food")).not.toHaveAttribute(
    "aria-activedescendant",
  );
  await press.ArrowDown();
  expect(q.option("Apple")).toHaveFocus();
});

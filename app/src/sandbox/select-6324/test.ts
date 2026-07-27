import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/6324
test("keeps focus on the select while arrow keys move the active item", async () => {
  const select = q.combobox("Fruit");
  await click(select);
  expect(select).toHaveFocus();

  await press.ArrowDown();

  expect(q.option("Banana")).toHaveAttribute("data-active-item");
  expect(select).toHaveFocus();
});

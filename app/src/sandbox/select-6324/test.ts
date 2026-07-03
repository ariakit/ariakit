import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/6324
test("focusOnMove={false} keeps focus while arrow keys move the active item", async () => {
  await click(q.combobox("Fruit"));
  expect(q.option("Apple")).toHaveFocus();

  await press.ArrowDown();

  expect(q.option("Banana")).toHaveAttribute("data-active-item");
  expect(q.option("Apple")).toHaveFocus();
});

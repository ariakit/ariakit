import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/pull/5240#discussion_r3973273374
test("opens and selects with a supplied store", async () => {
  const select = q.combobox("Fruit");
  expect(select).toHaveTextContent("Apple");
  await click(select);
  expect(q.option("Orange")).toBeVisible();
  await click(q.option("Orange"));
  expect(select).toHaveTextContent("Orange");
  expect(q.text("Selected fruit: Orange")).toBeVisible();
  expect(q.listbox.maybe()).not.toBeInTheDocument();
});

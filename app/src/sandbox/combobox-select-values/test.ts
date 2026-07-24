import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("renders the selected value and item state", async () => {
  expect(q.combobox("Favorite fruit")).toHaveTextContent("Apple");

  await click(q.combobox("Favorite fruit"));

  expect(q.option("Apple")).toHaveTextContent("✓");
  expect(q.option("Banana")).not.toHaveTextContent("✓");

  await click(q.option("Banana"));

  expect(q.combobox("Favorite fruit")).toHaveTextContent("Banana");
});

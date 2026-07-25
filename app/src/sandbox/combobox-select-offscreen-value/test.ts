import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("keeps value-less offscreen items offscreen with no selected value", async () => {
  await click(q.combobox("Fruit"));

  expect(q.option("No fruit")).toHaveAttribute("data-offscreen");
});

test("mounts the offscreen item matching the selected value", async () => {
  await click(q.combobox("Selected fruit"));

  expect(q.option("Apple")).not.toHaveAttribute("data-offscreen");
  expect(q.option("No selected fruit")).toHaveAttribute("data-offscreen");
});

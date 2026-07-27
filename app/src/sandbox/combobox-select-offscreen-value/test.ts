import { click, q, type } from "@ariakit/test";
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

// https://github.com/ariakit/ariakit/pull/6832
test("activates an item that renders after typeahead movement", async () => {
  const select = q.combobox("Selected fruit");
  await click(select);
  await type("ly");

  expect(q.option("Lychee")).toHaveAttribute("data-active-item");
  expect(select).toHaveFocus();
});

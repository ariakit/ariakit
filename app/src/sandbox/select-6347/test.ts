import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/6347
test("typeahead skips disabled offscreen select items", async () => {
  await click(q.combobox("Fruit"));
  expect(q.option.ensure("Apple")).toHaveAttribute("data-active-item");
  expect(q.option.ensure("Papaya")).toHaveAttribute("data-offscreen");

  await press("p");

  expect(q.option.ensure("Papaya")).not.toHaveAttribute("data-active-item");
  expect(q.option.ensure("Peach")).toHaveAttribute("data-active-item");
});

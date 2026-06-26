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

test("typeahead includes accessible disabled offscreen select items", async () => {
  await click(q.combobox("Accessible fruit"));
  expect(q.option.ensure("Pawpaw")).toHaveAttribute("data-offscreen");
  expect(q.option.ensure("Pawpaw")).toHaveAttribute("aria-disabled", "true");

  await press("p");

  expect(q.option.ensure("Pawpaw")).toHaveAttribute("data-active-item");
});

test("typeahead skips aria-disabled offscreen select items", async () => {
  await click(q.combobox("ARIA disabled fruit"));
  expect(q.option.ensure("Papaw")).toHaveAttribute("data-offscreen");
  expect(q.option.ensure("Papaw")).toHaveAttribute("aria-disabled", "true");

  await press("p");

  expect(q.option.ensure("Papaw")).not.toHaveAttribute("data-active-item");
  expect(q.option.ensure("Peach")).toHaveAttribute("data-active-item");
});

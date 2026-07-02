import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/6347
test("typeahead skips disabled offscreen select items", async () => {
  await click(q.combobox("Fruit"));
  expect(q.option("Apple")).toHaveAttribute("data-active-item");
  expect(q.option("Papaya")).toHaveAttribute("data-offscreen");

  await press("p");

  expect(q.option("Papaya")).not.toHaveAttribute("data-active-item");
  expect(q.option("Peach")).toHaveAttribute("data-active-item");
});

test("typeahead includes accessible disabled offscreen select items", async () => {
  await click(q.combobox("Accessible fruit"));
  expect(q.option("Pawpaw")).toHaveAttribute("data-offscreen");
  expect(q.option("Pawpaw")).toHaveAttribute("aria-disabled", "true");

  await press("p");

  expect(q.option("Pawpaw")).toHaveAttribute("data-active-item");
});

test("typeahead skips aria-disabled offscreen select items", async () => {
  await click(q.combobox("ARIA disabled fruit"));
  expect(q.option("Papaw")).toHaveAttribute("data-offscreen");
  expect(q.option("Papaw")).toHaveAttribute("aria-disabled", "true");

  await press("p");

  expect(q.option("Papaw")).not.toHaveAttribute("data-active-item");
  expect(q.option("Peach")).toHaveAttribute("data-active-item");
});

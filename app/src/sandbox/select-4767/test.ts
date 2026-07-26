import { click, press, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/4767
test("keeps virtual focus on the select while moving through the items", async () => {
  const select = q.combobox("Favorite fruit");
  await click(select);
  const apple = q.option("Apple");
  expect(select).toHaveFocus();
  expect(apple).toHaveFocus();

  await press.ArrowDown();
  const banana = q.option("Banana");
  expect(select).toHaveFocus();
  expect(select).toHaveAttribute("aria-activedescendant", banana?.id);
  expect(banana).toHaveFocus();
  expect(banana).toHaveAttribute("data-focus-visible", "true");

  await press.ArrowDown();
  const orange = q.option("Orange");
  expect(select).toHaveFocus();
  expect(select).toHaveAttribute("aria-activedescendant", orange?.id);
  expect(orange).toHaveFocus();
  expect(orange).toHaveAttribute("data-focus-visible", "true");
  expect(apple).not.toHaveAttribute("data-focus-visible");
  expect(banana).not.toHaveAttribute("data-focus-visible");
});

// https://github.com/ariakit/ariakit/issues/4767
test("focuses the selected item when opening in real-focus mode", async () => {
  const select = q.combobox("Real focus fruit");
  await click(select);
  const apple = q.option("Apple");
  expect(apple).toHaveFocus();
  expect(select).not.toHaveFocus();
  expect(apple).toHaveAttribute("data-active-item");

  await press.ArrowDown();
  const banana = q.option("Banana");
  expect(banana).toHaveFocus();
  expect(banana).toHaveAttribute("data-active-item");
  expect(banana).toHaveAttribute("data-focus-visible", "true");

  await press.ArrowDown();
  const orange = q.option("Orange");
  expect(orange).toHaveFocus();
  expect(orange).toHaveAttribute("data-active-item");
  expect(orange).toHaveAttribute("data-focus-visible", "true");
  expect(apple).not.toHaveAttribute("data-focus-visible");
  expect(banana).not.toHaveAttribute("data-focus-visible");
});

test("focuses the input in a filterable select", async () => {
  await click(q.combobox("Filterable fruit"));

  expect(q.combobox("Filter Filterable fruit")).toHaveFocus();
  expect(q.option("Apple")).toHaveAttribute("data-active-item");
});

// https://github.com/ariakit/ariakit/pull/6832#discussion_r3649290438
test("keeps focus on the items when typing in real-focus mode", async () => {
  const select = q.combobox("Real focus fruit");
  await click(select);
  await press.ArrowDown();
  const banana = q.option("Banana");
  expect(banana).toHaveFocus();

  await press.Backspace();
  expect(banana).toHaveFocus();
  expect(select).not.toHaveFocus();

  await type("o");
  expect(q.option("Orange")).toHaveFocus();
  expect(select).not.toHaveFocus();
});

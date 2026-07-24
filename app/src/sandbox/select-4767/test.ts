import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// https://github.com/ariakit/ariakit/issues/4767
test("clears focus-visible with a non-focusable list", async () => {
  const select = q.combobox("Favorite fruit");
  await click(select);
  const apple = q.option("Apple");
  expect(select).toHaveFocus();
  expect(apple).toHaveFocus();

  await press.ArrowDown();
  const banana = q.option("Banana");
  expect(select).toHaveFocus();
  expect(banana).toHaveFocus();
  expect(banana).toHaveAttribute("data-focus-visible", "true");

  await press.ArrowDown();

  const orange = q.option("Orange");
  expect(select).toHaveFocus();
  expect(orange).toHaveFocus();
  expect(orange).toHaveAttribute("data-focus-visible", "true");
  expect(apple).not.toHaveAttribute("data-focus-visible");
  expect(banana).not.toHaveAttribute("data-focus-visible");
});

// https://github.com/ariakit/ariakit/issues/4767
test("preserves virtual focus with a focusable owner", async () => {
  const select = q.combobox("Virtual focus fruit");
  await click(select);
  expect(select).toHaveFocus();

  await press.ArrowDown();
  const banana = q.option("Banana");
  expect(select).toHaveFocus();
  expect(banana?.id).toBeTruthy();
  expect(select?.getAttribute("aria-activedescendant")).toBe(banana?.id);
  expect(banana).toHaveFocus();
  expect(banana).toHaveAttribute("data-focus-visible", "true");

  await press.ArrowDown();
  const orange = q.option("Orange");
  expect(select).toHaveFocus();
  expect(orange?.id).toBeTruthy();
  expect(select?.getAttribute("aria-activedescendant")).toBe(orange?.id);
  expect(orange).toHaveFocus();
  expect(orange).toHaveAttribute("data-focus-visible", "true");
  expect(banana).not.toHaveAttribute("data-focus-visible");
});

// https://github.com/ariakit/ariakit/issues/4767
test("preserves select focus in real-focus mode", async () => {
  const select = q.combobox("Real focus fruit");
  await click(select);
  const apple = q.option("Apple");
  expect(select).toHaveFocus();
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

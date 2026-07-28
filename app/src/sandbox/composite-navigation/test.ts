import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

test("navigates a non-looping composite", async () => {
  const apple = q.button("Apple");
  const grape = q.button("Grape");
  const orange = q.button("Orange");
  expect(apple).not.toHaveFocus();
  await expect.poll(() => apple).toHaveAttribute("data-active-item");

  await press.Tab();
  expect(apple).toHaveFocus();
  expect(apple).toHaveAttribute("data-active-item");

  await press.ArrowDown();
  expect(grape).toHaveFocus();
  expect(grape).toHaveAttribute("data-active-item");

  await press.ArrowDown();
  expect(orange).toHaveFocus();
  await press.ArrowUp();
  expect(grape).toHaveFocus();
  await press.ArrowRight();
  expect(orange).toHaveFocus();
  await press.ArrowLeft();
  expect(grape).toHaveFocus();

  await press.ArrowDown();
  await press.ArrowDown();
  expect(orange).toHaveFocus();
  expect(orange).toHaveAttribute("data-active-item");
});

// https://github.com/ariakit/ariakit/issues/4083
test("moves focus-visible state to the next item", async () => {
  await press.Tab();
  const apple = q.button("Apple");
  const grape = q.button("Grape");
  expect(apple).toHaveAttribute("data-focus-visible", "true");
  expect(apple).toHaveAttribute("data-active-item", "true");

  await press.ArrowDown();
  expect(apple).not.toHaveAttribute("data-focus-visible");
  expect(apple).not.toHaveAttribute("data-active-item");
  expect(grape).toHaveAttribute("data-focus-visible", "true");
  expect(grape).toHaveAttribute("data-active-item", "true");
});

test("navigates a grid without focus shifting", async () => {
  await click(q.gridcell("0A1"));
  for (const [key, name] of [
    ["ArrowDown", "0B1"],
    ["ArrowRight", "0B2"],
    ["ArrowDown", "0C2"],
    ["ArrowRight", "0C3"],
    ["ArrowUp", "0A3"],
    ["ArrowDown", "0C3"],
  ] as const) {
    await press(key);
    expect(q.gridcell(name)).toHaveFocus();
  }
});

test("navigates a grid with focus shifting", async () => {
  await click(q.gridcell("1A1"));
  for (const [key, name] of [
    ["ArrowDown", "1B1"],
    ["ArrowRight", "1B2"],
    ["ArrowDown", "1C2"],
    ["ArrowRight", "1C3"],
    ["ArrowUp", "1B2"],
    ["ArrowUp", "1A2"],
    ["ArrowRight", "1A3"],
    ["ArrowDown", "1B2"],
    ["ArrowDown", "1C2"],
  ] as const) {
    await press(key);
    expect(q.gridcell(name)).toHaveFocus();
  }
});

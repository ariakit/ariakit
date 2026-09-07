import { click, focus, press, q, sleep } from "@ariakit/test";
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

// https://github.com/ariakit/ariakit/issues/7099
test("moves focus-visible with an Alt-modified navigation key", async () => {
  const apple = q.button("Apple");
  const grape = q.button("Grape");

  await click(apple);
  expect(apple).toHaveFocus();
  expect(apple).not.toHaveAttribute("data-focus-visible");

  await press.ArrowDown(null, { altKey: true });
  expect(grape).toHaveFocus();
  expect(grape).toHaveAttribute("data-focus-visible", "true");
});

// https://github.com/ariakit/ariakit/issues/7099
// Orange is the last item of the non-looping composite, so the key moves
// nothing and no focus event fires. Only the item's own keydown handling can
// apply the attribute here. The test above moves focus instead, which discards
// that handling when the item blurs before its callback runs.
test("shows focus-visible on the item when an Alt-modified navigation key doesn't move focus", async () => {
  const orange = q.button("Orange");

  await click(orange);
  expect(orange).toHaveFocus();
  expect(orange).not.toHaveAttribute("data-focus-visible");

  await press.ArrowDown(null, { altKey: true });
  expect(orange).toHaveFocus();
  expect(orange).toHaveAttribute("data-focus-visible", "true");
});

// https://github.com/ariakit/ariakit/issues/7099
test("moves focus-visible with Ctrl+Home on a grid", async () => {
  const cell = q.gridcell("0B2");
  const firstCell = q.gridcell("0A1");

  await click(cell);
  expect(cell).toHaveFocus();
  expect(cell).not.toHaveAttribute("data-focus-visible");

  await press.Home(null, { ctrlKey: true });
  expect(firstCell).toHaveFocus();
  expect(firstCell).toHaveAttribute("data-focus-visible", "true");
});

// https://github.com/ariakit/ariakit/issues/7099
// The counterpart of the tests above. A modified key that Ariakit doesn't use
// to move focus is typing or a shortcut, so it must keep pointer modality.
test("keeps pointer modality on a modified non-navigation key", async () => {
  const orange = q.button("Orange");
  const grape = q.button("Grape");

  await click(orange);
  expect(orange).toHaveFocus();

  await press("c", null, { ctrlKey: true });
  expect(orange).toHaveFocus();
  expect(orange).not.toHaveAttribute("data-focus-visible");

  // The shortcut must leave the global modality alone too, which is only
  // observable on the next element to receive focus.
  await focus(grape);
  expect(grape).toHaveFocus();
  // focus() only flushes microtasks, so cross the frame the queued
  // focus-visible callback would use before asserting it never arrives.
  await sleep();
  expect(grape).not.toHaveAttribute("data-focus-visible");
});

test("updates focus order through the deprecated prop", async () => {
  await click(q.checkbox("Include composite element in focus order"));
  expect(q.checkbox("Include composite element in focus order")).toBeChecked();

  await focus(q.button("Legacy two"));
  await press.ArrowRight();

  expect(q.toolbar("Legacy focus order")).toHaveFocus();
});

import { click, focus, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// examples/toolbar/test.ts
test("moves through toolbar items with keyboard commands", async () => {
  const toolbar = q.toolbar("Basic formatting");
  const toolbarQuery = q.within(toolbar);
  const undo = toolbarQuery.button("Undo");
  const bold = toolbarQuery.button("Bold");
  const underline = toolbarQuery.button("Underline");

  await focus(undo);
  await press.ArrowRight();
  expect(bold).toHaveFocus();
  await press.End();
  expect(underline).toHaveFocus();
  await press.Home();
  expect(undo).toHaveFocus();
  await press.ArrowDown();
  expect(undo).toHaveFocus();
});

// https://github.com/ariakit/ariakit/issues/3232
// examples/toolbar-active-id-disabled/test.ts
test("enters a toolbar whose active item is disabled", async () => {
  const toolbar = q.toolbar("Disabled active item");
  const italic = q.within(toolbar).button("Italic");

  await focus(q.button("Before disabled active item"));
  await press.Tab();
  expect(italic).toHaveFocus();
  await press.Tab();
  expect(q.button("After disabled active item")).toHaveFocus();
  await press.ShiftTab();
  expect(italic).toHaveFocus();
});

// https://github.com/ariakit/ariakit/issues/4129
// examples/toolbar-active-id-stale/test.ts
test("recovers when the active toolbar item is removed", async () => {
  const toolbar = q.toolbar("Stale active item");
  const toolbarQuery = q.within(toolbar);
  const bold = toolbarQuery.button("Bold");
  const italic = toolbarQuery.button("Italic");
  const underline = toolbarQuery.button("Underline");

  await focus(bold);
  await press.ArrowRight();
  expect(italic).toHaveFocus();
  await click(q.button("Toggle italic"));
  await press.ShiftTab();
  expect(underline).toHaveFocus();
  await press.ArrowLeft();
  expect(bold).toHaveFocus();
});

// examples/toolbar-select/test.ts
test("composes a ComboboxSelect with toolbar navigation", async () => {
  const toolbar = q.toolbar("Selectable text formatting");
  const toolbarQuery = q.within(toolbar);
  const bold = toolbarQuery.button("Bold");
  const underline = toolbarQuery.button("Underline");
  const select = toolbarQuery.combobox("Text alignment");

  await focus(bold);
  await press.End();
  expect(select).toHaveFocus();
  await press.ArrowDown();
  expect(q.option("Align Left")).toHaveFocus();
  await press.ArrowDown();
  await press.Enter();
  expect(select).toHaveTextContent("Align Center");
  await press.ArrowLeft();
  expect(underline).toHaveFocus();
});

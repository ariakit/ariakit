import { click, press, q, type } from "@ariakit/test";
import { expect, test } from "vitest";

function getSelectionStart(element: Element | HTMLInputElement | null) {
  return element && "selectionStart" in element ? element.selectionStart : null;
}

test("move cursor without moving through items", async () => {
  await click(q.combobox("Direction"));
  await type("abc");
  expect(getSelectionStart(q.combobox("Direction"))).toBe(3);
  await press.ArrowLeft();
  expect(getSelectionStart(q.combobox("Direction"))).toBe(2);
  expect(q.gridcell.all(undefined, { selected: true })).toHaveLength(0);
  await press.Home();
  expect(getSelectionStart(q.combobox("Direction"))).toBe(0);
  expect(q.gridcell.all(undefined, { selected: true })).toHaveLength(0);
});

test("move through items without moving the cursor", async () => {
  await click(q.combobox("Direction"));
  await type("abc");
  expect(getSelectionStart(q.combobox("Direction"))).toBe(3);
  await press.ArrowDown();
  expect(q.gridcell("Top Left")).toHaveFocus();
  await press.End();
  expect(q.gridcell("Top Right")).toHaveFocus();
  await press.ArrowLeft();
  expect(q.gridcell("Top Center")).toHaveFocus();
  expect(getSelectionStart(q.combobox("Direction"))).toBe(3);
  await press.Home();
  expect(q.gridcell("Top Left")).toHaveFocus();
  expect(getSelectionStart(q.combobox("Direction"))).toBe(3);
});

test("move through items moving the cursor", async () => {
  await click(q.combobox("Direction"));
  await type("abc");
  expect(getSelectionStart(q.combobox("Direction"))).toBe(3);
  await press.ArrowDown();
  expect(q.gridcell("Top Left")).toHaveFocus();
  await press.End();
  expect(q.gridcell("Top Right")).toHaveFocus();
  await press.Home();
  await press.Home();
  expect(q.gridcell("Top Left")).toHaveFocus();
  expect(getSelectionStart(q.combobox("Direction"))).toBe(0);
  await press.End();
  expect(q.gridcell("Top Right")).toHaveFocus();
  expect(getSelectionStart(q.combobox("Direction"))).toBe(0);
  await press.End();
  expect(q.gridcell("Top Right")).toHaveFocus();
  expect(getSelectionStart(q.combobox("Direction"))).toBe(3);
  await press.ArrowLeft();
  expect(q.gridcell("Top Center")).toHaveFocus();
  expect(getSelectionStart(q.combobox("Direction"))).toBe(3);
  await press.ArrowLeft();
  expect(q.gridcell("Top Left")).toHaveFocus();
  expect(getSelectionStart(q.combobox("Direction"))).toBe(3);
  await press.ArrowLeft();
  expect(q.gridcell("Top Left")).toHaveFocus();
  expect(getSelectionStart(q.combobox("Direction"))).toBe(2);
});

// Reproduces https://github.com/ariakit/ariakit/issues/7305
test("uses the nested grid role for groups and rows", async () => {
  await click(q.combobox("Grouped direction"));
  const grid = q.grid("Grouped directions");
  const gridQuery = q.within(grid);
  expect(gridQuery.rowgroup()).toBeInTheDocument();
  expect(gridQuery.row()).toBeInTheDocument();
  expect(gridQuery.gridcell.all()).toHaveLength(2);
});

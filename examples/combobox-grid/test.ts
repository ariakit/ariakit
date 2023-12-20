import { click, press, q, type } from "@ariakit/test";

function getSelectionStart(element: Element | HTMLInputElement | null) {
  return element && "selectionStart" in element ? element.selectionStart : null;
}

test("move cursor without moving through items", async () => {
  await click(q.combobox());
  await type("abc");
  expect(getSelectionStart(q.combobox())).toBe(3);
  await press.ArrowLeft();
  expect(getSelectionStart(q.combobox())).toBe(2);
  expect(q.gridcell.all(undefined, { selected: true })).toHaveLength(0);
  await press.Home();
  expect(getSelectionStart(q.combobox())).toBe(0);
  expect(q.gridcell.all(undefined, { selected: true })).toHaveLength(0);
});

test("move through items without moving the cursor", async () => {
  await click(q.combobox());
  await type("abc");
  expect(getSelectionStart(q.combobox())).toBe(3);
  await press.ArrowDown();
  expect(q.gridcell("Top Left")).toHaveFocus();
  await press.End();
  expect(q.gridcell("Top Right")).toHaveFocus();
  await press.ArrowLeft();
  expect(q.gridcell("Top Center")).toHaveFocus();
  expect(getSelectionStart(q.combobox())).toBe(3);
  await press.Home();
  expect(q.gridcell("Top Left")).toHaveFocus();
  expect(getSelectionStart(q.combobox())).toBe(3);
});

test("move through items moving the cursor", async () => {
  await click(q.combobox());
  await type("abc");
  expect(getSelectionStart(q.combobox())).toBe(3);
  await press.ArrowDown();
  expect(q.gridcell("Top Left")).toHaveFocus();
  await press.End();
  expect(q.gridcell("Top Right")).toHaveFocus();
  await press.Home();
  await press.Home();
  expect(q.gridcell("Top Left")).toHaveFocus();
  expect(getSelectionStart(q.combobox())).toBe(0);
  await press.End();
  expect(q.gridcell("Top Right")).toHaveFocus();
  expect(getSelectionStart(q.combobox())).toBe(0);
  await press.End();
  expect(q.gridcell("Top Right")).toHaveFocus();
  expect(getSelectionStart(q.combobox())).toBe(3);
  await press.ArrowLeft();
  expect(q.gridcell("Top Center")).toHaveFocus();
  expect(getSelectionStart(q.combobox())).toBe(3);
  await press.ArrowLeft();
  expect(q.gridcell("Top Left")).toHaveFocus();
  expect(getSelectionStart(q.combobox())).toBe(3);
  await press.ArrowLeft();
  expect(q.gridcell("Top Left")).toHaveFocus();
  expect(getSelectionStart(q.combobox())).toBe(2);
});

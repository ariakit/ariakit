import { click, press, q } from "@ariakit/test";

test("move through grid without focus shift", async () => {
  await click(q.gridcell("0A1"));

  await press.ArrowDown();
  expect(q.gridcell("0B1")).toHaveFocus();

  await press.ArrowRight();
  expect(q.gridcell("0B2")).toHaveFocus();

  await press.ArrowDown();
  expect(q.gridcell("0C2")).toHaveFocus();

  await press.ArrowRight();
  expect(q.gridcell("0C3")).toHaveFocus();

  await press.ArrowUp();
  expect(q.gridcell("0A3")).toHaveFocus();

  await press.ArrowDown();
  expect(q.gridcell("0C3")).toHaveFocus();
});

test("move through grid with focus shift", async () => {
  await click(q.gridcell("1A1"));

  await press.ArrowDown();
  expect(q.gridcell("1B1")).toHaveFocus();

  await press.ArrowRight();
  expect(q.gridcell("1B2")).toHaveFocus();

  await press.ArrowDown();
  expect(q.gridcell("1C2")).toHaveFocus();

  await press.ArrowRight();
  expect(q.gridcell("1C3")).toHaveFocus();

  await press.ArrowUp();
  expect(q.gridcell("1B2")).toHaveFocus();

  await press.ArrowUp();
  expect(q.gridcell("1A2")).toHaveFocus();

  await press.ArrowRight();
  expect(q.gridcell("1A3")).toHaveFocus();

  await press.ArrowDown();
  expect(q.gridcell("1B2")).toHaveFocus();

  await press.ArrowDown();
  expect(q.gridcell("1C2")).toHaveFocus();
});

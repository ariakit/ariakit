import { press, q } from "@ariakit/test";

const { loadTestCase } = testing;

test("correctly traps focus", async () => {
  await loadTestCase("trap");

  await press.Tab();
  expect(q.text("Before")).toHaveFocus();
  await press.Tab();
  expect(q.text("Trap")).toHaveFocus();
  await press.Tab();
  expect(q.text("After")).toHaveFocus();
});

test("correctly redirects focus", async () => {
  await loadTestCase("redirect");

  await press.Tab();
  expect(q.text("Before")).toHaveFocus();
  await press.Tab();
  expect(q.text("Focus target")).toHaveFocus();
  await press.ShiftTab();
  expect(q.text("Skip")).toHaveFocus();
  await press.ShiftTab();
  expect(q.text("Focus target")).toHaveFocus();
});

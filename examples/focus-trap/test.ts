import { click, press, q } from "@ariakit/test";

function setup() {
  const before = document.createElement("div");
  before.tabIndex = 0;
  before.textContent = "Before";
  const after = before.cloneNode() as HTMLDivElement;
  after.textContent = "After";
  document.body.prepend(before);
  document.body.append(after);
  return () => {
    before.remove();
    after.remove();
  };
}

test("correctly traps focus", async () => {
  const cleanup = setup();
  await press.Tab();
  expect(q.text("Before")).toHaveFocus();
  await press.Tab();
  expect(q.checkbox()).toHaveFocus();
  await press.Tab();
  expect(q.button()).toHaveFocus();
  await press.Tab();
  expect(q.text("After")).not.toHaveFocus();
  await press.Tab();
  expect(q.button()).toHaveFocus();
  await press.ShiftTab();
  expect(q.checkbox()).toHaveFocus();
  await press.ShiftTab();
  expect(q.text("Before")).not.toHaveFocus();
  cleanup();
});

test("correctly releases focus", async () => {
  const cleanup = setup();
  // First, disabling focus trap
  await click(q.labeled("Trap focus"));
  expect(q.checkbox()).toHaveFocus();
  await press.Tab();
  expect(q.button()).toHaveFocus();
  await press.Tab();
  expect(q.text("After")).toHaveFocus();
  await press.ShiftTab();
  expect(q.button()).toHaveFocus();
  await press.ShiftTab();
  expect(q.checkbox()).toHaveFocus();
  await press.ShiftTab();
  expect(q.text("Before")).toHaveFocus();
  cleanup();
});

import {
  click,
  getByLabelText,
  getByRole,
  getByText,
  press,
} from "@ariakit/test";

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
  expect(getByText("Before")).toHaveFocus();
  await press.Tab();
  expect(getByRole("checkbox")).toHaveFocus();
  await press.Tab();
  expect(getByRole("button")).toHaveFocus();
  await press.Tab();
  expect(getByText("After")).not.toHaveFocus();
  await press.Tab();
  expect(getByRole("button")).toHaveFocus();
  await press.ShiftTab();
  expect(getByRole("checkbox")).toHaveFocus();
  await press.ShiftTab();
  expect(getByText("Before")).not.toHaveFocus();
  cleanup();
});

test("correctly releases focus", async () => {
  const cleanup = setup();
  // First, disabling focus trap
  await click(getByLabelText("Trap focus"));
  expect(getByRole("checkbox")).toHaveFocus();
  await press.Tab();
  expect(getByRole("button")).toHaveFocus();
  await press.Tab();
  expect(getByText("After")).toHaveFocus();
  await press.ShiftTab();
  expect(getByRole("button")).toHaveFocus();
  await press.ShiftTab();
  expect(getByRole("checkbox")).toHaveFocus();
  await press.ShiftTab();
  expect(getByText("Before")).toHaveFocus();
  cleanup();
});

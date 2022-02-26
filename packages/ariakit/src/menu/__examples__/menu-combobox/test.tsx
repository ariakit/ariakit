import { click, getByRole, press, render } from "ariakit-test-utils";
import Example from ".";

const getMenuButton = () => getByRole("button", { name: "Add block" });
const getMenu = () => getByRole("dialog", { hidden: true });
const getCombobox = () => getByRole("combobox");
const getOption = (name: string) => getByRole("option", { name });

test("show/hide on click", async () => {
  render(<Example />);
  expect(getMenu()).not.toBeVisible();
  await click(getMenuButton());
  expect(getMenu()).toBeVisible();
  expect(getCombobox()).toHaveFocus();
  expect(getMenu()).not.toHaveFocus();
  expect(getOption("Paragraph")).not.toHaveFocus();
  await click(getMenuButton());
  expect(getMenu()).not.toBeVisible();
  expect(getMenuButton()).toHaveFocus();
});

// test("show/hide on enter", async () => {
//   render(<Example />);
//   await press.Tab();
//   await press.Enter();
//   expect(getMenu()).toBeVisible();
//   expect(getOption("Edit")).toHaveFocus();
//   expect(getOption("Edit")).toHaveAttribute("data-focus-visible");
//   await press.ShiftTab();
//   expect(getMenu()).toBeVisible();
//   await press.Enter();
//   expect(getMenu()).not.toBeVisible();
// });

// test("show/hide on space", async () => {
//   render(<Example />);
//   await press.Tab();
//   await press.Space();
//   expect(getMenu()).toBeVisible();
//   expect(getOption("Edit")).toHaveFocus();
//   expect(getOption("Edit")).toHaveAttribute("data-focus-visible");
//   await press.ShiftTab();
//   expect(getMenu()).toBeVisible();
//   await press.Space();
//   expect(getMenu()).not.toBeVisible();
// });

// test("show on arrow down", async () => {
//   render(<Example />);
//   await press.Tab();
//   await press.ArrowDown();
//   expect(getMenu()).toBeVisible();
//   expect(getOption("Edit")).toHaveFocus();
// });

// test("show on arrow up", async () => {
//   render(<Example />);
//   await press.Tab();
//   await press.ArrowUp();
//   expect(getMenu()).toBeVisible();
//   expect(getOption("Report")).toHaveFocus();
// });

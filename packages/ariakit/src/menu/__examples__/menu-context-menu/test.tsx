import {
  click,
  fireEvent,
  getByRole,
  getByText,
  press,
  render,
} from "ariakit-test-utils";
import Example from ".";

const getContextMenuArea = () => getByText("Right click here");
const getMenu = () => getByRole("menu", { hidden: true });
const getMenuItem = (name: string) => getByRole("menuitem", { name });

test("show context menu and hide it with escape", async () => {
  render(<Example />);
  expect(getMenu()).not.toBeVisible();
  fireEvent.contextMenu(getContextMenuArea());
  expect(getMenu()).toBeVisible();
  expect(getMenu()).toHaveFocus();
  fireEvent.contextMenu(getContextMenuArea());
  expect(getMenu()).toBeVisible();
  expect(getMenu()).toHaveFocus();
  await press.Escape();
  expect(getMenu()).not.toBeVisible();
});

test("show context menu and hide it by clicking outside", async () => {
  render(<Example />);
  fireEvent.contextMenu(getContextMenuArea());
  expect(getMenu()).toBeVisible();
  await click(document.body);
  expect(getMenu()).not.toBeVisible();
});

test("navigate through context menu with keyboard", async () => {
  render(<Example />);
  fireEvent.contextMenu(getContextMenuArea());
  expect(getMenu()).toBeVisible();
  await press.ArrowDown();
  expect(getMenuItem("Back")).toHaveFocus();
  await press.ArrowDown();
  expect(getMenuItem("Reload")).toHaveFocus();
  await press.Home();
  expect(getMenuItem("Back")).toHaveFocus();
  await press.End();
  expect(getMenuItem("Inspect")).toHaveFocus();
});

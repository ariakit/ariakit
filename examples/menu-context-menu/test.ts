import {
  act,
  click,
  fireEvent,
  getByRole,
  getByText,
  press,
} from "@ariakit/test";

function nextFrame(): Promise<void> {
  return act<void>(
    () => new Promise((resolve) => requestAnimationFrame(() => resolve())),
  );
}

const getContextMenuArea = () => getByText("Right click here");
const getMenu = () => getByRole("menu", { hidden: true });
const getMenuItem = (name: string) => getByRole("menuitem", { name });

test("show context menu and hide it with escape", async () => {
  expect(getMenu()).not.toBeVisible();
  fireEvent.contextMenu(getContextMenuArea());
  await nextFrame();
  expect(getMenu()).toBeVisible();
  expect(getMenu()).toHaveFocus();
  fireEvent.contextMenu(getContextMenuArea());
  await nextFrame();
  expect(getMenu()).toBeVisible();
  expect(getMenu()).toHaveFocus();
  await press.Escape();
  expect(getMenu()).not.toBeVisible();
});

test("show context menu and hide it by clicking outside", async () => {
  fireEvent.contextMenu(getContextMenuArea());
  await nextFrame();
  expect(getMenu()).toBeVisible();
  await click(document.body);
  expect(getMenu()).not.toBeVisible();
});

test("navigate through context menu with keyboard", async () => {
  fireEvent.contextMenu(getContextMenuArea());
  await nextFrame();
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

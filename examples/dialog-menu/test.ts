import { click, getByRole, press, queryByRole } from "@ariakit/test";

const getDisclosure = () => getByRole("button", { name: "View recipe" });

const getDialog = () =>
  queryByRole("dialog", { hidden: true, name: "Homemade Cake" });

const getDialogBackdrop = () => {
  const dialog = getDialog();
  const backdrop = dialog?.parentElement;
  expect(backdrop).toBeInTheDocument();
  return backdrop!;
};

const getMenuButton = () => getByRole("button", { name: "Share" });

const getMenu = () => queryByRole("menu", { hidden: true, name: "Share" });

test("show dialog", async () => {
  expect(getDialog()).not.toBeInTheDocument();
  await click(getDisclosure());
  expect(getDialog()).toBeVisible();
});

test("show/hide menu", async () => {
  expect(getMenu()).not.toBeInTheDocument();
  await click(getDisclosure());
  await click(getMenuButton());
  expect(getMenu()).toBeVisible();
  expect(getMenu()).toHaveFocus();
  await click(getMenuButton());
  expect(getMenu()).not.toBeInTheDocument();
  await click(getMenuButton());
  expect(getMenu()).toBeVisible();
  expect(getMenu()).toHaveFocus();
});

test("hide menu and dialog with esc", async () => {
  await click(getDisclosure());
  await click(getMenuButton());
  expect(getDialog()).toBeVisible();
  expect(getMenu()).toBeVisible();
  await press.Escape();
  expect(getDialog()).toBeVisible();
  expect(getMenu()).not.toBeInTheDocument();
  expect(getMenuButton()).toHaveFocus();
  await press.Escape();
  expect(getDialog()).not.toBeInTheDocument();
  expect(getDisclosure()).toHaveFocus();
});

test("hide menu by clicking on dialog", async () => {
  await click(getDisclosure());
  await click(getMenuButton());
  expect(getDialog()).toBeVisible();
  expect(getMenu()).toBeVisible();
  await click(getDialog()!);
  expect(getDialog()).toBeVisible();
  expect(getMenu()).not.toBeInTheDocument();
  expect(getMenuButton()).toHaveFocus();
});

test("hide both menu and dialog by clicking outside dialog", async () => {
  await click(getDisclosure());
  await click(getMenuButton());
  expect(getDialog()).toBeVisible();
  expect(getMenu()).toBeVisible();
  await click(getDialogBackdrop());
  expect(getDialog()).not.toBeInTheDocument();
  expect(getMenu()).not.toBeInTheDocument();
  expect(getDisclosure()).toHaveFocus();
});

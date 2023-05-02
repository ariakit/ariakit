import { click, getByRole, press, queryByRole } from "@ariakit/test";

const getCartDisclosure = () => getByRole("button", { name: "View Cart" });

const getCartDialog = () =>
  queryByRole("dialog", { hidden: true, name: "Your Shopping Cart" });

const getDismissButton = () => getByRole("button", { name: "Dismiss popup" });

const getRemoveButton = (product: string) =>
  getByRole("button", { name: `Remove ${product}` });

const getConfirmDialog = () =>
  queryByRole("dialog", { hidden: true, name: "Remove product" });

const getCancelButton = () => getByRole("button", { name: "Cancel" });

const getBackdrop = (dialog: string) => {
  const dialogElement = getByRole("dialog", { name: dialog });
  const id = dialogElement.id;
  const backdrop = document.querySelector(`[data-backdrop="${id}"]`);
  expect(backdrop).toBeInTheDocument();
  return backdrop as HTMLElement;
};

test("show cart dialog", async () => {
  expect(getCartDialog()).not.toBeInTheDocument();
  await click(getCartDisclosure());
  expect(getCartDialog()).toBeVisible();
  expect(getDismissButton()).toHaveFocus();
});

test("hide cart dialog with escape", async () => {
  await click(getCartDisclosure());
  expect(getCartDialog()).toBeVisible();
  expect(getDismissButton()).toHaveFocus();
  await press.Escape();
  expect(getCartDialog()).not.toBeInTheDocument();
  expect(getCartDisclosure()).toHaveFocus();
});

test("hide cart dialog by clicking outside", async () => {
  await click(getCartDisclosure());
  expect(getCartDialog()).toBeVisible();
  expect(getDismissButton()).toHaveFocus();
  await click(getBackdrop("Your Shopping Cart"));
  expect(getCartDialog()).not.toBeInTheDocument();
  expect(getCartDisclosure()).toHaveFocus();
});

test("show confirm dialog", async () => {
  await click(getCartDisclosure());
  expect(getConfirmDialog()).not.toBeInTheDocument();
  await click(getRemoveButton("Warm Jacket"));
  expect(getCartDialog()).toBeVisible();
  expect(getConfirmDialog()).toBeVisible();
  expect(getCancelButton()).toHaveFocus();
  await press.Enter();
  expect(getConfirmDialog()).not.toBeInTheDocument();
  expect(getCartDialog()).toBeVisible();
  expect(getRemoveButton("Warm Jacket")).toHaveFocus();
});

test("hide confirm dialog by pressing escape", async () => {
  await click(getCartDisclosure());
  await click(getRemoveButton("Warm Jacket"));
  expect(getConfirmDialog()).toBeVisible();
  await press.Escape();
  expect(getConfirmDialog()).not.toBeInTheDocument();
  expect(getCartDialog()).toBeVisible();
  expect(getRemoveButton("Warm Jacket")).toHaveFocus();
});

test("hide confirm dialog by clicking outside", async () => {
  await click(getCartDisclosure());
  await click(getRemoveButton("Warm Jacket"));
  expect(getConfirmDialog()).toBeVisible();
  await click(getBackdrop("Remove product"));
  expect(getConfirmDialog()).not.toBeInTheDocument();
  expect(getCartDialog()).toBeVisible();
  expect(getRemoveButton("Warm Jacket")).toHaveFocus();
});

import { click, press, q } from "@ariakit/test";

function backdrop(name: string) {
  const dialog = q.dialog.ensure(name);
  const id = dialog.id;
  const backdrop = document.querySelector(`[data-backdrop="${id}"]`);
  expect(backdrop).toBeInTheDocument();
  return backdrop as HTMLElement;
}

test("show cart dialog", async () => {
  expect(q.dialog("Your Shopping Cart")).not.toBeInTheDocument();
  await click(q.button("View Cart"));
  expect(q.dialog("Your Shopping Cart")).toBeVisible();
  expect(q.button("Dismiss popup")).toHaveFocus();
});

test("hide cart dialog with escape", async () => {
  await click(q.button("View Cart"));
  expect(q.dialog("Your Shopping Cart")).toBeVisible();
  expect(q.button("Dismiss popup")).toHaveFocus();
  await press.Escape();
  expect(q.dialog("Your Shopping Cart")).not.toBeInTheDocument();
  expect(q.button("View Cart")).toHaveFocus();
});

test("hide cart dialog by clicking outside", async () => {
  await click(q.button("View Cart"));
  expect(q.dialog("Your Shopping Cart")).toBeVisible();
  expect(q.button("Dismiss popup")).toHaveFocus();
  await click(backdrop("Your Shopping Cart"));
  expect(q.dialog("Your Shopping Cart")).not.toBeInTheDocument();
  expect(q.button("View Cart")).toHaveFocus();
});

test("show confirm dialog", async () => {
  await click(q.button("View Cart"));
  expect(q.dialog("Remove product")).not.toBeInTheDocument();
  await click(q.button("Remove Warm Jacket"));
  expect(q.dialog.includesHidden("Your Shopping Cart")).toBeVisible();
  expect(q.dialog("Your Shopping Cart")).not.toBeInTheDocument();
  expect(q.dialog("Remove product")).toBeVisible();
  expect(q.button("Cancel")).toHaveFocus();
  await press.Enter();
  expect(q.dialog("Remove product")).not.toBeInTheDocument();
  expect(q.dialog("Your Shopping Cart")).toBeVisible();
  expect(q.button("Remove Warm Jacket")).toHaveFocus();
});

test("hide confirm dialog by pressing escape", async () => {
  await click(q.button("View Cart"));
  await click(q.button("Remove Warm Jacket"));
  expect(q.dialog("Remove product")).toBeVisible();
  await press.Escape();
  expect(q.dialog("Remove product")).not.toBeInTheDocument();
  expect(q.dialog("Your Shopping Cart")).toBeVisible();
  expect(q.button("Remove Warm Jacket")).toHaveFocus();
});

test("hide confirm dialog by clicking outside", async () => {
  await click(q.button("View Cart"));
  await click(q.button("Remove Warm Jacket"));
  expect(q.dialog("Remove product")).toBeVisible();
  await click(backdrop("Remove product"));
  expect(q.dialog("Remove product")).not.toBeInTheDocument();
  expect(q.dialog("Your Shopping Cart")).toBeVisible();
  expect(q.button("Remove Warm Jacket")).toHaveFocus();
});

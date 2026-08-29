import { click, press, q, rightClick } from "@ariakit/test";
import { expect, test } from "vitest";

test("show context menu and hide it with escape", async () => {
  expect(q.menu.maybe()).not.toBeInTheDocument();
  await rightClick(q.text("Right click here"));
  await expect.poll(q.menu).toHaveFocus();
  expect(q.menu()).toBeVisible();
  await rightClick(q.text("Right click here"));
  await expect.poll(q.menu).toBeVisible();
  await press.Escape();
  expect(q.menu.maybe()).not.toBeInTheDocument();
});

test("show context menu and hide it by clicking outside", async () => {
  await rightClick(q.text("Right click here"));
  await expect.poll(q.menu).toBeVisible();
  await click(document.body);
  expect(q.menu.maybe()).not.toBeInTheDocument();
});

// The dialog names the focused control as a fallback disclosure, but a
// captured control can't be assumed to close the menu, so it doesn't join the
// modal context.
// https://github.com/ariakit/ariakit/issues/4270
// https://github.com/ariakit/ariakit/issues/7310
test("context menu keeps a dismiss button outside the menu", async () => {
  await click(q.button("Open menu"));
  await expect.poll(q.menu).toBeVisible();
  const dismiss = q.button("Dismiss popup");
  expect(dismiss).toBeInTheDocument();
  // The ARIA menu pattern doesn't allow a `button` among the menu's owned
  // elements, so the dismiss button renders next to the menu instead.
  expect(q.menu()).not.toContainElement(dismiss);
  expect(q.within(q.menu()).button.all()).toHaveLength(0);
  // The captured control doesn't join the modal context either.
  expect(q.button.maybe("Open menu")).not.toBeInTheDocument();
});

test("navigate through context menu with keyboard", async () => {
  await rightClick(q.text("Right click here"));
  await expect.poll(q.menu).toHaveFocus();
  await press.ArrowDown();
  expect(q.menuitem("Back")).toHaveFocus();
  await press.ArrowDown();
  expect(q.menuitem("Reload")).toHaveFocus();
  await press.Home();
  expect(q.menuitem("Back")).toHaveFocus();
  await press.End();
  expect(q.menuitem("Inspect")).toHaveFocus();
});

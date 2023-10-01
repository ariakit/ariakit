import { click, dispatch, press, q, waitFor } from "@ariakit/test";

test("show context menu and hide it with escape", async () => {
  expect(q.menu()).not.toBeInTheDocument();
  await dispatch.contextMenu(q.text("Right click here"));
  await waitFor(() => expect(q.menu()).toBeVisible());
  expect(q.menu()).toHaveFocus();
  await dispatch.contextMenu(q.text("Right click here"));
  await waitFor(() => expect(q.menu()).toBeVisible());
  expect(q.menu()).toHaveFocus();
  await press.Escape();
  expect(q.menu()).not.toBeInTheDocument();
});

test("show context menu and hide it by clicking outside", async () => {
  await dispatch.contextMenu(q.text("Right click here"));
  await waitFor(() => expect(q.menu()).toBeVisible());
  await click(document.body);
  expect(q.menu()).not.toBeInTheDocument();
});

test("navigate through context menu with keyboard", async () => {
  await dispatch.contextMenu(q.text("Right click here"));
  await waitFor(() => expect(q.menu()).toBeVisible());
  await press.ArrowDown();
  expect(q.menuitem("Back")).toHaveFocus();
  await press.ArrowDown();
  expect(q.menuitem("Reload")).toHaveFocus();
  await press.Home();
  expect(q.menuitem("Back")).toHaveFocus();
  await press.End();
  expect(q.menuitem("Inspect")).toHaveFocus();
});

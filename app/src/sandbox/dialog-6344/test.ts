import { click, q, rightClick } from "@ariakit/test";
import { expect, test } from "vitest";

// Reproduces https://github.com/ariakit/ariakit/issues/6344
test("stays open when interacting with a persistent element before the dialog is focused", async () => {
  await click(q.button("Open dialog"));
  expect(q.dialog("Dialog")).toBeVisible();

  // The dialog hasn't been focused yet (autoFocusOnShow={false}). Clicking
  // the persistent field must not close it.
  await click(q.textbox("Notification field"));
  expect(q.textbox("Notification field")).toHaveFocus();
  expect(q.dialog("Dialog")).toBeVisible();

  // Other interactions with the persistent region must not close it either.
  await click(q.button("Dismiss notification"));
  expect(q.dialog("Dialog")).toBeVisible();
});

test("stays open on right-clicking a persistent element before the dialog is focused", async () => {
  await click(q.button("Open dialog"));
  expect(q.dialog("Dialog")).toBeVisible();

  await rightClick(q.textbox("Notification field"));
  expect(q.dialog("Dialog")).toBeVisible();
});

test("keeps the documented behavior after the dialog has been focused", async () => {
  await click(q.button("Open dialog"));
  expect(q.dialog("Dialog")).toBeVisible();

  // Focusing inside the dialog first is the documented, working path.
  await click(q.textbox("Inside field"));
  expect(q.textbox("Inside field")).toHaveFocus();

  await click(q.textbox("Notification field"));
  expect(q.textbox("Notification field")).toHaveFocus();
  expect(q.dialog("Dialog")).toBeVisible();
});

test("keeps persistent elements inside after replacing the dialog node", async () => {
  await click(q.button("Open dialog"));
  expect(q.dialog("Dialog")).toHaveProperty("tagName", "DIV");

  await click(q.button("Replace dialog node"));
  expect(q.dialog("Dialog")).toHaveProperty("tagName", "SECTION");
  await click(q.textbox("Notification field"));

  expect(q.dialog("Dialog")).toBeVisible();
});

test("still closes when interacting outside before the dialog is focused", async () => {
  await click(q.button("Open dialog"));
  expect(q.dialog("Dialog")).toBeVisible();

  await click(q.textbox("Outside field"));
  await expect.poll(q.dialog.hidden.lazy("Dialog")).not.toBeVisible();
});

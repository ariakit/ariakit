import { click, press, q } from "@ariakit/test";
import { expect, test } from "vitest";

// See https://github.com/ariakit/ariakit/pull/6143
const installCount = () =>
  q.status.ensure("Parent hovercard mousemove listener installs").textContent;

test("toggling a nested hovercard does not reinstall the parent mousemove listener", async () => {
  expect(q.dialog("Parent hovercard")).toBeVisible();
  const initialInstalls = installCount();

  // Mounting a nested hovercard must not reinstall the parent's listener.
  await click(q.button("Toggle nested"));
  await expect.poll(q.dialog.lazy("Nested hovercard")).toBeVisible();
  expect(installCount()).toBe(initialInstalls);

  // Unmounting the nested hovercard must not reinstall it either.
  await click(q.button("Toggle nested"));
  await expect.poll(q.dialog.lazy("Nested hovercard")).not.toBeInTheDocument();
  expect(installCount()).toBe(initialInstalls);
});

test("closes nested hovercard on Escape when focus is outside", async () => {
  expect(q.dialog("Parent hovercard")).toBeVisible();

  await click(q.button("Toggle nested"));
  await expect.poll(q.dialog.lazy("Nested hovercard")).toBeVisible();

  await click(q.textbox("Outside input"));
  expect(q.textbox("Outside input")).toHaveFocus();
  expect(q.dialog("Nested hovercard")).toBeVisible();

  await press.Escape();
  await expect.poll(q.dialog.lazy("Nested hovercard")).not.toBeInTheDocument();
  expect(q.dialog("Parent hovercard")).toBeVisible();
});

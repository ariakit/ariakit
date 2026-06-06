import { click, q } from "@ariakit/test";
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

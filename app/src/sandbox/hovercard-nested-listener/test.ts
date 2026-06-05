import { click, q } from "@ariakit/test";
import { expect, test, vi } from "vitest";

test("does not reinstall mousemove listener when nested hovercards change", async () => {
  expect(q.dialog("Parent hovercard")).toBeVisible();

  const addEventListener = vi.spyOn(document, "addEventListener");
  const removeEventListener = vi.spyOn(document, "removeEventListener");

  try {
    await click(q.button("Toggle nested"));
    await expect.poll(() => q.dialog("Nested hovercard")).toBeVisible();
    await click(q.button("Toggle nested"));
    await expect
      .poll(() => q.dialog("Nested hovercard"))
      .not.toBeInTheDocument();

    const addedMouseMoveListeners = new Set(
      addEventListener.mock.calls
        .filter(([type, , options]) => type === "mousemove" && options === true)
        .map(([, listener]) => listener),
    );

    const removedExistingMouseMoveListeners =
      removeEventListener.mock.calls.filter(
        ([type, listener, options]) =>
          type === "mousemove" &&
          options === true &&
          !addedMouseMoveListeners.has(listener),
      );

    expect(removedExistingMouseMoveListeners).toHaveLength(0);
  } finally {
    addEventListener.mockRestore();
    removeEventListener.mockRestore();
  }
});

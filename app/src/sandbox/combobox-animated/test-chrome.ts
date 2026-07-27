import type { Locator } from "@playwright/test";
import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

function getTransitionState(element: Locator) {
  return element.evaluate((node) => {
    const style = getComputedStyle(node);
    return {
      duration: style.transitionDuration,
      isRunning: node
        .getAnimations()
        .some((animation) => animation.playState === "running"),
    };
  });
}

withFramework(import.meta.dirname, async ({ test }) => {
  test("combobox show/hide animation", async ({ q }) => {
    const combobox = q.combobox("Your favorite fruit");
    const listbox = q.listbox();
    await combobox.click();
    await expect(listbox).toBeVisible();
    expect(await getTransitionState(listbox)).toEqual({
      duration: "0.2s",
      isRunning: true,
    });

    await q.option("🍎 Apple").click();
    await expect(combobox).toBeFocused();
    await expect(listbox).toHaveAttribute("data-leave", "true");
    expect(await getTransitionState(listbox)).toEqual({
      duration: "0.2s",
      isRunning: true,
    });
    await expect(listbox).not.toBeVisible();
  });
});

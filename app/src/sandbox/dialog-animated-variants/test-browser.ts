import type { Locator } from "@playwright/test";
import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

const names = [
  "Transition",
  "TransitionBackdrop",
  "TransitionUnmount",
  "TransitionNoModal",
  "TransitionNoLeave",
  "Animation",
  "AnimationBackdrop",
  "AnimationUnmount",
  "AnimationNoModal",
  "AnimationLeave",
  "AnimationUnmountLeave",
];

function preservesLeaveTransition(name: string) {
  if (name.endsWith("NoLeave")) return false;
  if (!name.startsWith("Animation")) return true;
  return name.endsWith("Leave");
}

function usesAnimation(name: string) {
  return name.startsWith("Animation");
}

function usesTransition(name: string) {
  return name.startsWith("Transition");
}

function unmountsOnHide(name: string) {
  return name.includes("Unmount");
}

function getTransitionState(element: Locator) {
  return element.evaluate((node) => {
    const style = getComputedStyle(node);
    const opacity = Number(style.opacity);
    const isRunning = node
      .getAnimations()
      .some((animation) => animation.playState === "running");
    if (!isRunning) return;
    if (opacity <= 0 || opacity >= 1) return;
    return {
      duration: style.transitionDuration,
      property: style.transitionProperty,
    };
  });
}

function getAnimationState(element: Locator) {
  return element.evaluate((node) => {
    const style = getComputedStyle(node);
    return {
      duration: style.animationDuration,
      name: style.animationName,
      isRunning: node
        .getAnimations()
        .some((animation) => animation.playState === "running"),
    };
  });
}

withFramework(import.meta.dirname, async ({ test }) => {
  for (const name of names) {
    test(`${name} preserves its mount and leave behavior`, async ({
      page,
      q,
    }) => {
      const dialog = page.getByRole("dialog", {
        name,
        exact: true,
        includeHidden: true,
      });
      await q.button(name).click();
      await expect(dialog).toBeVisible();
      await expect(q.button("Close")).toBeFocused();

      if (usesTransition(name)) {
        await expect
          .poll(() => getTransitionState(dialog))
          .toEqual({ duration: "0.5s", property: "opacity" });
      }

      if (usesAnimation(name)) {
        expect(await getAnimationState(dialog)).toEqual({
          duration: "0.5s",
          name: "pulse",
          isRunning: true,
        });
      }

      await page.keyboard.press("Enter");
      await expect(q.button(name)).toBeFocused();

      if (preservesLeaveTransition(name)) {
        await expect(dialog).toBeAttached();
        await expect(dialog).toHaveAttribute("data-leave", "true");
        await expect(dialog).not.toHaveAttribute("hidden");
        await expect(dialog).not.toHaveCSS("display", "none");

        if (usesAnimation(name)) {
          expect(await getAnimationState(dialog)).toEqual({
            duration: "0.5s",
            name: "ping",
            isRunning: true,
          });
        }
      }

      if (unmountsOnHide(name)) {
        await expect(dialog).not.toBeAttached();
      } else {
        await expect(dialog).not.toBeVisible();
      }
    });
  }
});

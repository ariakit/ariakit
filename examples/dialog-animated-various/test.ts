// @vitest-environment jsdom
// This suite opts out of the default happy-dom environment. The animation-based
// leave cases (AnimationLeave/AnimationUnmountLeave) depend on
// `data-[leave]:animate-out` playing while the dialog closes. Under happy-dom's
// timer cadence, React commits a transient `mounted: false` render during close
// that cancels the leave transition, so the animation never plays and the dialog
// unmounts immediately. jsdom's requestAnimationFrame cadence keeps `mounted`
// stable through the close, matching real browsers.
import { click, press, q, sleep } from "@ariakit/test";
import { expect, test } from "vitest";

test.each([
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
])("%s", async (name) => {
  await click(q.button(name));
  // Wait for opacity to be greater than 0, otherwise toBeVisible() will fail
  await sleep(16);
  expect(q.dialog(name)).toBeVisible();
  expect(q.button("Close")).toHaveFocus();
  await press.Enter();
  expect(q.button(name)).toHaveFocus();
  await sleep(50);

  if (
    !name.endsWith("NoLeave") &&
    (!name.startsWith("Animation") || name.endsWith("Leave"))
  ) {
    expect(q.dialog(name)).toBeInTheDocument();
    expect(q.dialog(name)).not.toHaveAttribute("hidden");
    expect(q.dialog(name)).not.toHaveStyle("display: none");
  }

  await expect.poll(() => q.dialog(name)).not.toBeInTheDocument();
});

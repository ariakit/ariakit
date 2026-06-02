// @vitest-environment jsdom
//
// happy-dom's requestAnimationFrame fires almost immediately (~0ms) instead of
// the ~16ms real browsers use, which collapses the CSS keyframe leave timing
// these tests assert on. Pinned to jsdom.
import { click, press, q, sleep, waitFor } from "@ariakit/test";
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

  await waitFor(() => expect(q.dialog(name)).not.toBeInTheDocument());
});

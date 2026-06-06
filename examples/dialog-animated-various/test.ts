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
    // While it closes, the dialog disables its own tree with `inert`, so it's
    // matched only by the `hidden` query variant. It's still visually leaving,
    // which the following assertions verify.
    expect(q.dialog.hidden(name)).toBeInTheDocument();
    expect(q.dialog.hidden(name)).not.toHaveAttribute("hidden");
    expect(q.dialog.hidden(name)).not.toHaveStyle("display: none");
  }

  await expect.poll(q.dialog.lazy(name)).not.toBeInTheDocument();
});

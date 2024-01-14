import { click, press, q, sleep, waitFor } from "@ariakit/test";

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
])("%s", async (name) => {
  await click(q.button(name));
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

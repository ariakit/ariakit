import {
  expect,
  test,
  click,
  press,
  q,
  sleep,
  waitFor,
} from "../../browser-test-utils.ts";

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
    const closingDialog = q.dialog(name).query();
    if (closingDialog) {
      expect(closingDialog).not.toHaveAttribute("hidden");
      expect(closingDialog).not.toHaveStyle("display: none");
    }
  }

  await waitFor(() => expect(q.dialog(name)).not.toBeInTheDocument());
});

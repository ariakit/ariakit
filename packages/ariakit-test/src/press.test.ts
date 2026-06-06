// @vitest-environment jsdom
import { expect, test, vi } from "vitest";
import { press } from "./index.ts";

// jsdom (like a real browser) fires a manually dispatched click on a disabled
// control's listeners, while happy-dom suppresses it — so this guards the
// behavior in the environment where a missing disabled check would actually
// activate the control. `press.up` has no focusable guard, so without the check
// it would synthesize the default Space activation on a control that disabled
// itself mid-press but is still focused (the DOM test environments keep focus on
// it instead of blurring to the body the way a real browser does).
test("press.up does not activate a disabled control on Space release", async () => {
  const button = document.createElement("button");
  button.disabled = true;
  const onClick = vi.fn();
  button.addEventListener("click", onClick);
  document.body.append(button);

  await press.up.Space(button);

  expect(onClick).not.toHaveBeenCalled();
});

// @vitest-environment jsdom
import { expect, test, vi } from "vitest";
import { press } from "./index.ts";

// These run in jsdom, not the default happy-dom: jsdom (like a real browser)
// fires a manually dispatched click on a disabled control's listeners, while
// happy-dom suppresses it. So jsdom is where a missing disabled gate on the
// synthetic Space/Enter activation would actually click the control, making it
// the right environment to guard the gate.
test("press.up does not activate a disabled control on Space release", async () => {
  const button = document.createElement("button");
  button.disabled = true;
  const onClick = vi.fn();
  button.addEventListener("click", onClick);
  document.body.append(button);

  await press.up.Space(button);

  expect(onClick).not.toHaveBeenCalled();
});

test("press.down does not activate a control that disables itself on Enter", async () => {
  const button = document.createElement("button");
  const onClick = vi.fn();
  button.addEventListener("click", onClick);
  button.addEventListener("keydown", () => {
    button.disabled = true;
  });
  document.body.append(button);
  button.focus();

  // The Enter keydown disables the button before the synthetic activation runs;
  // a browser wouldn't click the now-disabled control, so neither should this.
  await press.down.Enter();

  expect(onClick).not.toHaveBeenCalled();
});

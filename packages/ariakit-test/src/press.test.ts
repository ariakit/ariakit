import { expect, test, vi } from "vitest";
import { press } from "./index.ts";

// A scripted click dispatched on a disabled control fires its listeners in jsdom
// and real browsers; happy-dom drops it, but `dispatch` normalizes that (see
// dispatch.ts), so these run in the default happy-dom. They guard the disabled
// gate on the synthetic Space/Enter activation: without the gate, the activation
// dispatches a click that — once normalized — would reach the listener here.
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

test("press.Enter on a textarea emits an Enter keypress charCode", async () => {
  const textarea = document.createElement("textarea");
  const onKeyPress = vi.fn();
  textarea.addEventListener("keypress", onKeyPress);
  document.body.append(textarea);

  await press.Enter(textarea);

  expect(onKeyPress).toHaveBeenCalledOnce();
  expect(onKeyPress).toHaveBeenLastCalledWith(
    expect.objectContaining({ charCode: 13 }),
  );
});

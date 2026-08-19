// @vitest-environment jsdom

import { expect, test } from "vitest";
import "./shims.ts";

test("leaves an environment that already implements mouse event members alone", () => {
  // jsdom implements the full `getModifierState`, including the `modifier*`
  // init members the happy-dom fallback cannot see, so replacing it would
  // silently downgrade every jsdom suite. Pin that guard from jsdom, since the
  // happy-dom default project makes it look redundant. Dropping the `x`/`y`
  // guard installs an equivalent accessor, so it has no such check.
  const event = new MouseEvent("auxclick", {
    modifierCapsLock: true,
    clientX: 3,
    clientY: 4,
  });
  expect(event.getModifierState("CapsLock")).toBe(true);
  expect([event.x, event.y]).toEqual([3, 4]);
});

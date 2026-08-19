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

test("leaves an environment with a conformant modifier state alone", () => {
  // jsdom already matches UI Events here, so the shim must leave it alone
  // rather than record the initializer itself. Pin that guard from jsdom, since
  // the happy-dom default project makes it look redundant.
  const event = new KeyboardEvent("keydown", {
    altKey: true,
    modifierCapsLock: true,
  });
  expect([
    event.getModifierState("CapsLock"),
    event.getModifierState("AltGraph"),
    event.getModifierState("alt"),
  ]).toEqual([true, false, false]);
  // `Super` is the member no engine reports even when the event is built with
  // it, measured on Chromium 151, Firefox 153, and WebKit 26.5. jsdom answers
  // it as UI Events specifies, and the shim records it too, so this pins the
  // behavior both implementations share rather than one that separates them.
  const superEvent = new KeyboardEvent("keydown", { modifierSuper: true });
  expect(superEvent.getModifierState("Super")).toBe(true);
  // Every answer above now matches whether or not the shim replaced jsdom's
  // implementation, so assert the replacement itself. jsdom's method is a
  // branded WebIDL operation and rejects a foreign `this`; the shim installs a
  // plain function, which answers `true` here instead of throwing. The thrown
  // error comes from jsdom's realm, so match that it throws rather than its
  // constructor identity.
  expect(() =>
    KeyboardEvent.prototype.getModifierState.call(
      { altKey: true } as unknown as KeyboardEvent,
      "Alt",
    ),
  ).toThrow();
});

import { expect, test } from "vitest";
import { isFocusEventOutside, isPortalEvent } from "./events.ts";

// Regression tests for https://github.com/ariakit/ariakit/issues/5156: a
// programmatically dispatched event can carry a non-Node target/relatedTarget
// (e.g. window or an XMLHttpRequest), which used to make these helpers call
// `contains()` on a non-node and throw "parameter 1 is not of type 'Node'".

test("isFocusEventOutside treats a non-element relatedTarget as outside", () => {
  const container = document.createElement("div");
  const event = { currentTarget: container, relatedTarget: new EventTarget() };
  expect(() => isFocusEventOutside(event)).not.toThrow();
  expect(isFocusEventOutside(event)).toBe(true);
});

test("isPortalEvent treats a non-element target as a portal event", () => {
  const container = document.createElement("div");
  const event = { currentTarget: container, target: new EventTarget() };
  expect(() => isPortalEvent(event)).not.toThrow();
  expect(isPortalEvent(event)).toBe(true);
});

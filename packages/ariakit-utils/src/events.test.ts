// @vitest-environment jsdom
// Uses DOM APIs the default node test environment doesn't provide.
import { expect, test } from "vitest";
import { isFocusEventOutside, isPortalEvent } from "./events.ts";

// Regression tests for https://github.com/ariakit/ariakit/issues/5156: a
// programmatically dispatched event can carry a non-node target/relatedTarget
// (e.g. window or an XMLHttpRequest), which used to make these helpers call
// `contains()` on a non-node and throw "parameter 1 is not of type 'Node'".

test("isFocusEventOutside treats a non-node relatedTarget as outside", () => {
  const container = document.createElement("div");
  const event = { currentTarget: container, relatedTarget: new EventTarget() };
  expect(() => isFocusEventOutside(event)).not.toThrow();
  expect(isFocusEventOutside(event)).toBe(true);
});

test("isPortalEvent treats a non-node target as a portal event", () => {
  const container = document.createElement("div");
  const event = { currentTarget: container, target: new EventTarget() };
  expect(() => isPortalEvent(event)).not.toThrow();
  expect(isPortalEvent(event)).toBe(true);
});

// Non-element nodes (such as text nodes, which a programmatically dispatched
// event can carry) are still passed to `contains`, preserving the original
// behavior rather than being rejected like a non-node target.

test("isFocusEventOutside keeps a contained text-node relatedTarget inside", () => {
  const container = document.createElement("div");
  const text = container.appendChild(document.createTextNode("hi"));
  const event = { currentTarget: container, relatedTarget: text };
  expect(isFocusEventOutside(event)).toBe(false);
});

test("isPortalEvent keeps a contained text-node target as non-portal", () => {
  const container = document.createElement("div");
  const text = container.appendChild(document.createTextNode("hi"));
  const event = { currentTarget: container, target: text };
  expect(isPortalEvent(event)).toBe(false);
});

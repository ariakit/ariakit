import { dispatch, q } from "@ariakit/test";
import { expect, test } from "vitest";

// A middle click activates a link through `auxclick`, so fire the single event
// that carries the activation rather than the whole `click` sequence.
// `dispatch` resolves to `false` when it was prevented.
function middleClick(element: Element | null) {
  return dispatch.auxClick(element, { detail: 1, button: 1 });
}

// Only the browser test covers the truly disabled link: `dispatch` routes
// around `pointer-events: none` the way a browser does, so its result would
// describe the ancestor that received the event, not the link.

test("middle click activates an enabled link", async () => {
  expect(await middleClick(q.link("Enabled link"))).toBe(true);
});

test("middle click activates an enabled tab rendered as a link", async () => {
  expect(await middleClick(q.tab("Overview"))).toBe(true);
});

// https://github.com/ariakit/ariakit/issues/7153
test("middle click does not activate an accessible disabled link", async () => {
  expect(await middleClick(q.link("Accessible disabled link"))).toBe(false);
});

// https://github.com/ariakit/ariakit/issues/7153
test("middle click does not activate a disabled tab rendered as a link", async () => {
  expect(await middleClick(q.tab("Billing"))).toBe(false);
});

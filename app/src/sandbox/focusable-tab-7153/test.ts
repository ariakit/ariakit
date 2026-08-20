import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// A middle click activates a link through `auxclick`, and happy-dom doesn't
// follow the destination, so the event's own `defaultPrevented` flag is what
// says whether the activation would have run. A disabled element stops the
// event before it bubbles back up, so the listener runs in the capture phase,
// ahead of the handler that prevents it, and the flag is read afterwards.
async function middleClickActivates(element: Element) {
  const auxClicks: Event[] = [];
  const record = (event: Event) => {
    // `click` routes around `pointer-events: none` the way a browser does, so
    // an event that landed elsewhere says nothing about this element.
    if (event.target !== element) return;
    auxClicks.push(event);
  };
  const { ownerDocument } = element;
  ownerDocument.addEventListener("auxclick", record, true);
  try {
    await click(element, { button: 1 });
  } finally {
    ownerDocument.removeEventListener("auxclick", record, true);
  }
  expect(auxClicks, "no auxclick landed on the element").toHaveLength(1);
  return auxClicks.every((event) => !event.defaultPrevented);
}

// Only the browser test covers the truly disabled link: `pointer-events: none`
// keeps the gesture away from it, so the `auxclick` never lands on the link.

test("middle click activates an enabled link", async () => {
  expect(await middleClickActivates(q.link("Enabled link"))).toBe(true);
});

test("middle click activates an enabled tab rendered as a link", async () => {
  expect(await middleClickActivates(q.tab("Overview"))).toBe(true);
});

// https://github.com/ariakit/ariakit/issues/7153
test("middle click does not activate an accessible disabled link", async () => {
  const link = q.link("Accessible disabled link");
  expect(await middleClickActivates(link)).toBe(false);
});

// https://github.com/ariakit/ariakit/issues/7153
test("middle click does not activate a disabled tab rendered as a link", async () => {
  expect(await middleClickActivates(q.tab("Billing"))).toBe(false);
});

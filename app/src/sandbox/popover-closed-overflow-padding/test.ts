import { q } from "@ariakit/test";
import { expect, test } from "vitest";

// The overflow padding variable is public API and must be exposed on the
// wrapper even while the popover is closed and hidden, before it first opens.
// Browser duplicate in test-browser.ts.
test("exposes the overflow padding variable on a closed popover", () => {
  expect(q.button("Closed popover")).toBeVisible();
  const popover = document.querySelector<HTMLElement>(".closed-popover");
  expect(popover).not.toBeNull();
  if (!popover) return;
  expect(popover).not.toBeVisible();
  const wrapper = popover.parentElement;
  expect(wrapper).not.toBeNull();
  if (!wrapper) return;
  // Popover exposes positioning styles on the element's wrapper.
  expect(
    getComputedStyle(wrapper).getPropertyValue("--popover-overflow-padding"),
  ).toBe("24px");
});

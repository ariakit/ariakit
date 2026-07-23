import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// Each popover has an explicit anchor, so the disclosure element isn't used
// for positioning. The preserveTabOrder feature, its remaining consumer,
// takes effect only on non-modal portals, so disclosure element updates must
// not re-render a modal popover, a plain non-portaled popover, or a portal with
// preserveTabOrder disabled. Browser duplicate in test-browser.ts.
test.each([
  {
    label: "Modal",
    name: "a modal popover when the disclosure element changes",
  },
  {
    label: "Plain",
    name: "a plain popover when the disclosure element changes",
  },
  {
    label: "No tab order",
    name: "a portaled popover when preserveTabOrder is disabled",
  },
])("does not re-render $name", async ({ label }) => {
  await click(q.button(`Toggle ${label} popover`));
  expect(q.dialog()).toBeVisible();

  const popoverRenders = q.status.ensure(`${label} popover renders`);
  const disclosureElementRenders = q.status.ensure(
    `${label} disclosure element renders`,
  );

  // The first click also moves focus into the button, which updates one-time
  // focus state, so sample the render counts only after that settles.
  await click(q.button(`Set ${label} disclosure element`));

  const previousPopoverRenders = popoverRenders.textContent;
  const previousDisclosureElementRenders = disclosureElementRenders.textContent;

  await click(q.button(`Set ${label} disclosure element`));

  expect(disclosureElementRenders.textContent).not.toBe(
    previousDisclosureElementRenders,
  );
  expect(popoverRenders.textContent).toBe(previousPopoverRenders);
});

// https://github.com/ariakit/ariakit/issues/3729
test("re-renders when the disclosure positioning fallback changes", async () => {
  await click(q.button("Toggle Fallback popover"));
  expect(q.dialog()).toBeVisible();

  const popoverRenders = q.status.ensure("Fallback popover renders");
  await click(q.button("Set Fallback disclosure element"));
  const previousPopoverRenders = popoverRenders.textContent;

  await click(q.button("Set Fallback disclosure element"));

  expect(popoverRenders.textContent).not.toBe(previousPopoverRenders);
});

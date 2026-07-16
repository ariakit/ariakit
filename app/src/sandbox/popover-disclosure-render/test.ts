import { click, q } from "@ariakit/test";
import { expect, test } from "vitest";

// The preserveTabOrder feature, the only consumer of the disclosure element
// in the popover, takes effect only on non-modal portals, so disclosure
// element updates must not re-render a modal popover or a plain non-portaled
// popover. Browser duplicate in test-browser.ts.
async function expectNoRenderOnDisclosureElementChange(label: string) {
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
}

test("does not re-render a modal popover when the disclosure element changes", async () => {
  await expectNoRenderOnDisclosureElementChange("Modal");
});

test("does not re-render a plain popover when the disclosure element changes", async () => {
  await expectNoRenderOnDisclosureElementChange("Plain");
});

import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

const cases = [
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
];

withFramework(import.meta.dirname, async ({ test }) => {
  // Each popover has an explicit anchor, so the disclosure element isn't used
  // for positioning. The preserveTabOrder feature, its remaining consumer,
  // takes effect only on non-modal portals, so disclosure element updates must
  // not re-render a modal popover, a plain non-portaled popover, or a portal
  // with preserveTabOrder disabled.
  for (const { label, name } of cases) {
    test(`does not re-render ${name}`, async ({ page, q }) => {
      await q.button(`Toggle ${label} popover`).click();
      await test.expect(q.dialog()).toBeVisible();

      // The first click also moves focus into the button, which updates
      // one-time focus state, so sample the render counts only after that
      // settles.
      await q.button(`Set ${label} disclosure element`).click();
      await flushFrames(page);

      const popoverRenders = q.status(`${label} popover renders`);
      const disclosureElementRenders = q.status(
        `${label} disclosure element renders`,
      );
      const previousPopoverRenders = await popoverRenders.textContent();
      const previousDisclosureElementRenders =
        await disclosureElementRenders.textContent();

      if (previousPopoverRenders == null) {
        throw new Error("Popover render count was not found");
      }
      if (previousDisclosureElementRenders == null) {
        throw new Error("Disclosure element render count was not found");
      }

      await q.button(`Set ${label} disclosure element`).click();

      await test
        .expect(disclosureElementRenders)
        .not.toHaveText(previousDisclosureElementRenders);
      await test.expect(popoverRenders).toHaveText(previousPopoverRenders);
    });
  }

  // https://github.com/ariakit/ariakit/issues/3729
  test("re-renders when the disclosure positioning fallback changes", async ({
    page,
    q,
  }) => {
    await q.button("Toggle Fallback popover").click();
    await test.expect(q.dialog()).toBeVisible();

    await q.button("Set Fallback disclosure element").click();
    await flushFrames(page);

    const popoverRenders = q.status("Fallback popover renders");
    const previousPopoverRenders = await popoverRenders.textContent();
    if (previousPopoverRenders == null) {
      throw new Error("Popover render count was not found");
    }

    await q.button("Set Fallback disclosure element").click();

    await test.expect(popoverRenders).not.toHaveText(previousPopoverRenders);
  });
});

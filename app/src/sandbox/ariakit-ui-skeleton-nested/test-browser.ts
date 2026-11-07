import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("paints the first placeholders of a nested root without a fade", async ({
    page,
    q,
  }) => {
    const showComments = q.button("Show comments");
    // The button is content of the outer root, so the outer root has shown its
    // content once it is visible.
    await test.expect(showComments).toBeVisible();
    // The comments request stays pending, so their placeholders never fade out
    // during the test.
    await q.checkbox("Keep loading comments").check();
    // Counts the opacity transitions that start in the comments, which mount
    // after the click.
    const transitions = await page.evaluateHandle(() => {
      const count = { value: 0 };
      document.addEventListener("transitionrun", (event) => {
        if (event.propertyName !== "opacity") return;
        if (!(event.target instanceof Element)) return;
        if (!event.target.closest("[aria-label='Comments']")) return;
        count.value += 1;
      });
      return count;
    });
    await showComments.click();
    await test
      .expect(q.region("Comments"))
      .toHaveAttribute("aria-busy", "true");
    // The placeholders are hidden from assistive technologies, and only the
    // pending marker tells whether they are painted.
    await test.expect(page.locator("[data-pending]")).toHaveCount(0);
    // A transition that starts with the new placeholders dispatches its event
    // in the next rendering frame, and no page state tracks that event.
    await flushFrames(page);
    test.expect(await transitions.evaluate(({ value }) => value)).toBe(0);
  });
});

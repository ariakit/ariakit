import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("shows the current section in the popover button", async ({ q }) => {
    const button = q.button("On this page");
    await test.expect(button).toBeVisible();
    // Put the heading where a link click would, at the scroll padding.
    await q.heading("Let it rest").evaluate((element) => {
      element.scrollIntoView({ block: "start" });
    });
    const current = q.button("Let it rest");
    await test.expect(current).toBeVisible();
    await current.click();
    const nav = query(q.navigation("On this page"));
    await test
      .expect(nav.link("Let it rest"))
      .toHaveAttribute("aria-current", "location");
    await nav.link("Make the dough").click();
    await test.expect(q.button("Make the dough")).toBeVisible();
  });

  test("shows the thumb at once when the popover opens again", async ({
    page,
    q,
  }) => {
    const nav = q.navigation("On this page");
    await q.button("On this page").click();
    await test.expect(nav).toBeVisible();
    await page.keyboard.press("Escape");
    await test.expect(nav).not.toBeVisible();
    // The visible sections change while the popover is closed.
    await q.heading("Store the bread").evaluate((element) => {
      element.scrollIntoView({ block: "start" });
    });
    await q.button("Store the bread").click();
    await test.expect(nav).toBeVisible();
    // The rows resize as the popover shows, and the observer that measures them
    // sets the range before the next frames paint. No state marks that moment,
    // and a glide from the old range would still run for its 200ms after it.
    await flushFrames(page);
    const animations = await nav.evaluate(
      (element) => element.getAnimations().length,
    );
    test.expect(animations).toBe(0);
  });

  test("measures the rows at the full size of the open popover", async ({
    q,
  }) => {
    const nav = q.navigation("On this page");
    await q.button("On this page").click();
    await test.expect(nav).toBeVisible();
    // The popover opens from a smaller scale, which doesn't resize the rows.
    // Once it ends, each piece of the thumb sits where its row is.
    await test.expect
      .poll(() =>
        q
          .dialog("Table of contents")
          .evaluate((element) => element.getAnimations().length),
      )
      .toBe(0);
    const offsets = await nav.evaluate((element) => {
      const top = element.getBoundingClientRect().top + element.clientTop;
      const thumbs = element.querySelectorAll<HTMLElement>(".toc-link-thumb");
      return [...thumbs].map((thumb) => {
        const piece = thumb.style.getPropertyValue("--toc-piece-top");
        const offset = thumb.getBoundingClientRect().top - top;
        return Math.abs(Number.parseFloat(piece) - offset);
      });
    });
    test.expect(offsets).toHaveLength(6);
    for (const offset of offsets) {
      test.expect(offset).toBeLessThan(0.5);
    }
  });
});

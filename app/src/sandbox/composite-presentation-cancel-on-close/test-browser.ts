import { flushFrames, withFramework } from "#app/test-utils/preview.ts";
import { recordScrollEvents } from "#app/test-utils/scroll.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // A presentation that parks while the popup is being positioned has to be
  // abandoned when the popup goes away, because closing content is never
  // presented into. The store notifies its listeners synchronously, so the
  // parked request is woken while the item is still rendered and still visible:
  // nothing else stops it from scrolling the page to a popup that never got
  // placed.
  // Browser-only: the symptom is the document scroll offset, which happy-dom
  // cannot model because it stubs `scrollIntoView`.
  // https://github.com/ariakit/ariakit/issues/6986
  test("abandons a parked presentation when the popup closes", async ({
    page,
    q,
  }) => {
    const menu = q.menu("Actions");
    await page.evaluate(() => window.scrollTo({ top: 700 }));
    await test.expect.poll(() => page.evaluate(() => window.scrollY)).toBe(700);

    await q.button("Show Actions").click();
    await test.expect(menu).toBeVisible();
    // The whole test rests on the popup being genuinely unplaced here, so pin
    // it rather than trusting the held callback to have taken effect.
    await test.expect(menu).toHaveAttribute("data-placing");

    await q.button("Move to last Actions action").click();
    await test.expect(q.menuitem("Rename")).toHaveAttribute("data-active-item");

    const scroll = await recordScrollEvents(page);
    await q.button("Hide Actions").click();
    await test.expect(menu).not.toBeVisible();

    // Hiding is itself what would wake a surviving request: it clears the
    // placing state on the way out, while the item is still rendered. There is
    // no positive state for an abandoned presentation, so wait through the
    // checkpoint where that scroll would have landed.
    await flushFrames(page);
    test.expect(await page.evaluate(() => window.scrollY)).toBe(700);
    test.expect(await scroll.events()).not.toContain("document");
  });

  // An animated popup stays mounted for its whole exit transition, so the
  // mounted state cannot see the close on its own. Positioning that finishes
  // during that transition would otherwise wake a parked request and scroll the
  // page toward a popup the user has already dismissed.
  test("abandons a parked presentation when an animated popup starts closing", async ({
    page,
    q,
  }) => {
    const menu = q.menu("Animated actions");
    await page.evaluate(() => window.scrollTo({ top: 700 }));
    await test.expect.poll(() => page.evaluate(() => window.scrollY)).toBe(700);

    await q.button("Show Animated actions").click();
    await test.expect(menu).toBeVisible();
    await test.expect(menu).toHaveAttribute("data-placing");

    await q.button("Move to last Animated actions action").click();
    await test.expect(q.menuitem("Rename")).toHaveAttribute("data-active-item");

    const scroll = await recordScrollEvents(page);
    await q.button("Hide Animated actions").click();
    // Still mounted, because the exit transition is running. This is the state
    // the guard exists for, so pin it before releasing positioning.
    await test.expect(menu).toBeVisible();

    // Completing positioning now is what wakes a surviving request, and it has
    // a placed popup to scroll to, so nothing else would stop it.
    await q.button("Finish Animated actions positioning").click();
    await flushFrames(page);
    test.expect(await page.evaluate(() => window.scrollY)).toBe(700);
    test.expect(await scroll.events()).not.toContain("document");
  });
});

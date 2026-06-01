import { withFramework } from "#app/test-utils/preview.ts";

declare global {
  interface Window {
    optionFocusCount: number;
  }
}

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/3837
  //
  // On some Android devices, the keyboard's autocomplete bar repeatedly changes
  // the visual viewport height while typing. That changes the available space
  // Floating UI computes for the popover (the `--popover-available-height`
  // variable), which drives the popover max-height and, in a virtualized list,
  // the set of rendered items. With `autoSelect`, every rendered-items change
  // re-ran the auto-select logic and called `store.move()` on the already-active
  // item. Because `move()` always bumps the internal `moves` counter, Composite
  // re-focused the item via `focusIntoView`, bouncing DOM focus off the input
  // and back. This focus churn dropped characters while typing.
  //
  // We simulate the viewport change deterministically by shrinking the popover
  // through the same `--popover-available-height` variable, then assert that
  // focus never leaves the combobox input.
  test("resizing the popover does not bounce focus while auto-selecting", async ({
    page,
    q,
  }) => {
    const selectButton = q.combobox("Country");
    const input = q.combobox("Search...");
    const popover = page.locator(".popover");

    await selectButton.click();
    await test.expect(input).toBeFocused();

    await page.keyboard.type("a");
    // The first matching item is auto-selected as the user types.
    await test.expect(q.option().first()).toHaveAttribute("data-active-item");

    // The list is virtualized, so only a few of the matches are rendered.
    const renderedBefore = await q.option().count();
    test.expect(renderedBefore).toBeGreaterThan(2);
    test.expect(renderedBefore).toBeLessThan(50);

    const flushFrames = (frames: number) =>
      page.evaluate(
        (n) =>
          new Promise<void>((resolve) => {
            const tick = () =>
              n-- > 0 ? requestAnimationFrame(tick) : resolve();
            tick();
          }),
        frames,
      );

    // The virtualizer's ResizeObserver ignores its very first callback, so flush
    // a couple of frames to make sure that first callback has already fired.
    // Otherwise a fast run could have our resize below swallowed as the ignored
    // one, and the bug would not reproduce.
    await flushFrames(2);

    // From now on, count any focus event that lands on an option element.
    await page.evaluate(() => {
      window.optionFocusCount = 0;
      document.addEventListener(
        "focusin",
        (event) => {
          const target = event.target as HTMLElement | null;
          if (target?.getAttribute("role") === "option") {
            window.optionFocusCount += 1;
          }
        },
        true,
      );
    });

    const heightBefore = await popover.evaluate((el) => el.clientHeight);

    // Shrink the popover the same way Floating UI does when the available
    // viewport space changes (it writes `--popover-available-height` on the
    // wrapper; the popover consumes it through `max-height`). Setting it on the
    // popover itself produces the same layout result.
    await popover.evaluate((el) => {
      el.style.setProperty("--popover-available-height", "120px");
    });

    // Wait until the popover has actually shrunk, then let the virtualizer and
    // any focus side effects settle across a few frames.
    await test.expect
      .poll(() => popover.evaluate((el) => el.clientHeight))
      .toBeLessThan(heightBefore);
    await flushFrames(5);

    // The auto-selected item is still active, but focus must have stayed on the
    // input the whole time — the resize must not move focus to the option.
    await test.expect(input).toBeFocused();
    await test.expect(q.option().first()).toHaveAttribute("data-active-item");
    test.expect(await page.evaluate(() => window.optionFocusCount)).toBe(0);
  });
});

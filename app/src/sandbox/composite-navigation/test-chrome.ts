import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // Composite items are focused with `preventScroll`, so the item is only
  // revealed because the composite scrolls it into view afterwards. Without
  // that, keyboard navigation would silently move focus off screen.
  test("scrolls the page to reveal the item reached with the keyboard", async ({
    page,
    q,
  }) => {
    const near = q.button("Near fruit");
    const distant = q.button("Distant fruit");
    await near.focus();
    await test.expect(near).toBeFocused();
    await test.expect(distant).not.toBeInViewport();
    const scrollY = await page.evaluate(() => window.scrollY);

    await page.keyboard.press("ArrowDown");

    await test.expect(distant).toHaveAttribute("data-active-item");
    await test.expect(distant).toBeFocused();
    await test.expect(distant).toBeInViewport();
    // Pin the movement to the document scroller so a scrollable wrapper added
    // to the fixture later cannot silently satisfy the viewport check instead.
    await test.expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(scrollY);
  });

  // https://github.com/ariakit/ariakit/issues/7099
  test("moves focus-visible with an Alt-modified navigation key", async ({
    page,
    q,
  }) => {
    const apple = q.button("Apple");
    const grape = q.button("Grape");

    await apple.click();
    await test.expect(apple).toBeFocused();
    // data-focus-visible is applied from a queued callback a frame later, so
    // cross those frames before asserting it never arrives.
    await flushFrames(page);
    await test.expect(apple).not.toHaveAttribute("data-focus-visible");

    await page.keyboard.press("Alt+ArrowDown");

    await test.expect(grape).toBeFocused();
    await test.expect(grape).toHaveAttribute("data-focus-visible", "true");
  });

  // https://github.com/ariakit/ariakit/issues/7099
  // Orange is the last item of the non-looping composite, so the key moves
  // nothing and no focus event fires. Only the item's own keydown handling can
  // apply the attribute here. The test above moves focus instead, which
  // discards that handling when the item blurs before its callback runs.
  test("shows focus-visible on the item when an Alt-modified navigation key doesn't move focus", async ({
    page,
    q,
  }) => {
    const orange = q.button("Orange");

    await orange.click();
    await test.expect(orange).toBeFocused();
    // data-focus-visible is applied from a queued callback a frame later, so
    // cross those frames before asserting it never arrives.
    await flushFrames(page);
    await test.expect(orange).not.toHaveAttribute("data-focus-visible");

    await page.keyboard.press("Alt+ArrowDown");

    await test.expect(orange).toBeFocused();
    await test.expect(orange).toHaveAttribute("data-focus-visible", "true");
  });

  // https://github.com/ariakit/ariakit/issues/7099
  test("moves focus-visible with Ctrl+Home on a grid", async ({ page, q }) => {
    const cell = q.gridcell("0B2");
    const firstCell = q.gridcell("0A1");

    await cell.click();
    await test.expect(cell).toBeFocused();
    // data-focus-visible is applied from a queued callback a frame later, so
    // cross those frames before asserting it never arrives.
    await flushFrames(page);
    await test.expect(cell).not.toHaveAttribute("data-focus-visible");

    await page.keyboard.press("Control+Home");

    await test.expect(firstCell).toBeFocused();
    await test.expect(firstCell).toHaveAttribute("data-focus-visible", "true");
  });

  // https://github.com/ariakit/ariakit/issues/7099
  // The counterpart of the tests above. A modified key that Ariakit doesn't use
  // to move focus is typing or a shortcut, so it must keep pointer modality.
  test("keeps pointer modality on a modified non-navigation key", async ({
    page,
    q,
  }) => {
    const orange = q.button("Orange");
    const grape = q.button("Grape");

    await orange.click();
    await test.expect(orange).toBeFocused();

    await page.keyboard.press("Control+c");

    await test.expect(orange).toBeFocused();
    // data-focus-visible is applied from a queued callback a frame later, so
    // cross those frames before asserting it never arrives.
    await flushFrames(page);
    await test.expect(orange).not.toHaveAttribute("data-focus-visible");

    // The shortcut must leave the global modality alone too, which is only
    // observable on the next element to receive focus.
    await grape.focus();
    await test.expect(grape).toBeFocused();
    // data-focus-visible is applied from a queued callback a frame later, so
    // cross those frames before asserting it never arrives.
    await flushFrames(page);
    await test.expect(grape).not.toHaveAttribute("data-focus-visible");
  });

  test("updates focus order through the deprecated prop", async ({
    page,
    q,
  }) => {
    const checkbox = q.checkbox("Include composite element in focus order");
    await checkbox.click();
    await test.expect(checkbox).toBeChecked();

    await q.button("Legacy two").focus();
    await page.keyboard.press("ArrowRight");

    await test.expect(q.toolbar("Legacy focus order")).toBeFocused();
  });
});

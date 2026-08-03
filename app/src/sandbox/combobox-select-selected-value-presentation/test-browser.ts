import { flushFrames, withFramework } from "#app/test-utils/preview.ts";
import { recordScrollEvents } from "#app/test-utils/scroll.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/pull/6832
  test("focuses a far item reached through typeahead", async ({ page, q }) => {
    const select = q.combobox("Selected fruit");
    await select.click();
    await test.expect(select).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.type("ly");

    const lychee = q.option("Lychee");
    await test.expect(lychee).toHaveAttribute("data-active-item");
    await test.expect(lychee).toBeInViewport();
    await test.expect(select).toBeFocused();
  });

  test("reopening presents a far selected item", async ({ page, q }) => {
    const select = q.combobox("Single selected fruit");
    await select.click();
    await test.expect(select).toHaveAttribute("aria-expanded", "true");
    await test.expect(q.option("Apple")).toHaveAttribute("data-active-item");

    const watermelon = q.option("Watermelon");
    await page.keyboard.press("w");
    await test.expect(watermelon).toHaveAttribute("data-active-item");
    await page.keyboard.press("Enter");
    await test.expect(select).toHaveText("Watermelon");
    await test.expect(q.listbox()).not.toBeVisible();
    await select.click();

    await test.expect(watermelon).toHaveAttribute("data-active-item");
    await test.expect(watermelon).toBeInViewport();
    await test.expect(select).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/pull/6832
  test("presents a far selected item with real focus", async ({ page, q }) => {
    const select = q.combobox("Filterable fruit");
    const watermelon = q.option("Watermelon");
    await select.click();
    await test.expect(select).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await test.expect(select).toHaveAttribute("aria-expanded", "false");
    await test.expect(q.listbox()).not.toBeVisible();
    await page.evaluate(() => window.scrollTo({ top: 100 }));
    await test.expect.poll(() => page.evaluate(() => window.scrollY)).toBe(100);

    await select.click();
    await test.expect(select).toHaveAttribute("aria-expanded", "true");

    await test.expect(q.combobox("Search Filterable fruit")).toBeFocused();
    await test.expect(watermelon).toBeInViewport();
    test.expect(await page.evaluate(() => window.scrollY)).toBe(100);
  });

  // https://github.com/ariakit/ariakit/pull/6832
  test("cancels presentation when real focus moves", async ({ page, q }) => {
    await q.combobox("Focus moving filterable fruit").click();

    await test.expect(q.option("Focus target")).toBeFocused();
    // Focus has moved before the pending presentation callback can run. There
    // is no positive state for its cancellation, so wait through its checkpoint.
    await flushFrames(page);
    await test.expect(q.option("Focus target")).toBeInViewport();
    await test.expect(q.option("Watermelon")).not.toBeInViewport();
  });

  // https://github.com/ariakit/ariakit/issues/6986
  test("cancels presentation when virtual focus leaves the popup", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Escaping fruit");
    const escapeTarget = q.button("Escaping fruit focus target");

    await page.evaluate(() => window.scrollTo({ top: 100 }));
    await test.expect.poll(() => page.evaluate(() => window.scrollY)).toBe(100);
    // Clicking a select that isn't fully visible would scroll the page to reach
    // it, and that scroll would land inside the measurement below.
    await test.expect(select).toBeInViewport({ ratio: 1 });
    const scroll = await recordScrollEvents(page);

    await select.click();

    // Focus left the popup while it was still being positioned, so nothing may
    // pull it back and nothing may move the page on the way out. There is no
    // positive state for the pending presentation being abandoned, so wait
    // through its checkpoint before confirming focus stayed put.
    await test.expect(escapeTarget).toBeFocused();
    await flushFrames(page);
    await test.expect(escapeTarget).toBeFocused();
    test.expect(await page.evaluate(() => window.scrollY)).toBe(100);
    test.expect(await scroll.events()).not.toContain("document");
  });

  // https://github.com/ariakit/ariakit/issues/7020
  test("cancels the item handoff presentation when focus leaves an open popup", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Page escaping fruit");
    const escapeTarget = q.button("Page escaping fruit focus target");

    // Clicking a select that isn't fully visible would scroll the page to reach
    // it, and that scroll would land inside the measurement below.
    await select.scrollIntoViewIfNeeded();
    await test.expect(select).toBeInViewport({ ratio: 1 });
    const scrollY = await page.evaluate(() => window.scrollY);
    const scroll = await recordScrollEvents(page);

    await select.click();

    // The popup stays open, so the presentation the item handoff scheduled is
    // only abandoned if it sees the escape.
    await test.expect(escapeTarget).toBeFocused();
    // Placement is the gate a surviving request parks behind, so pin it rather
    // than trusting a frame flush to have covered it.
    await test.expect(q.listbox()).not.toHaveAttribute("data-placing");
    await test.expect(escapeTarget).toBeFocused();
    // The popup is still open and the marked item is still the active one, so
    // none of the three abandon reasons the request already honours can be what
    // stopped it.
    await test.expect(q.listbox()).toBeVisible();
    await test
      .expect(q.option("Watermelon"))
      .toHaveAttribute("data-active-item");
    test.expect(await page.evaluate(() => window.scrollY)).toBe(scrollY);
    test.expect(await scroll.events()).not.toContain("document");
    // And the marked item is still out of view, so the page really was the only
    // thing a surviving presentation could have scrolled.
    await test.expect(q.option("Watermelon")).not.toBeInViewport();
  });

  // This case originated in the unmerged PR below. It covers the same
  // focus-move cancellation invariant when the popup remounts on open and the
  // select element briefly becomes the composite again.
  // https://github.com/ariakit/ariakit/pull/6994
  test("cancels presentation when real focus moves in an unmounted popup", async ({
    page,
    q,
  }) => {
    await q.combobox("Focus moving unmounted fruit").click();

    await test.expect(q.option("Focus target")).toBeFocused();
    // Focus has moved before the pending presentation callback can run. There
    // is no positive state for its cancellation, so wait through its checkpoint.
    await flushFrames(page);
    await test.expect(q.option("Focus target")).toBeInViewport();
    await test.expect(q.option("Watermelon")).not.toBeInViewport();
  });
});

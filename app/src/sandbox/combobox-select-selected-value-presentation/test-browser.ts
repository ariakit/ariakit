import type { Locator } from "@playwright/test";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

function getCenterOffset(item: Locator) {
  return item.evaluate((element) => {
    const listbox = element.closest<HTMLElement>("[role=listbox]");
    if (!listbox) return Infinity;
    const listboxRect = listbox.getBoundingClientRect();
    const itemRect = element.getBoundingClientRect();
    const scaleY = listboxRect.height / listbox.offsetHeight;
    const viewportStart = listboxRect.top + listbox.clientTop * scaleY;
    const viewportEnd = viewportStart + listbox.clientHeight * scaleY;
    const viewportCenter = (viewportStart + viewportEnd) / 2;
    const itemCenter = itemRect.top + itemRect.height / 2;
    return itemCenter - viewportCenter;
  });
}

function getTopOffset(item: Locator) {
  return item.evaluate((element) => {
    const listbox = element.closest<HTMLElement>("[role=listbox]");
    if (!listbox) return Infinity;
    const listboxRect = listbox.getBoundingClientRect();
    const itemRect = element.getBoundingClientRect();
    const scaleY = listboxRect.height / listbox.offsetHeight;
    const viewportStart = listboxRect.top + listbox.clientTop * scaleY;
    return itemRect.top - viewportStart;
  });
}

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
  // https://github.com/ariakit/ariakit/issues/6838
  test("centers a far selected item with real focus", async ({ page, q }) => {
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
    await test.expect
      .poll(async () => Math.abs(await getCenterOffset(watermelon)))
      .toBeLessThanOrEqual(1);
    await test.expect(watermelon).toBeInViewport();
    test.expect(await page.evaluate(() => window.scrollY)).toBe(100);
  });

  // https://github.com/ariakit/ariakit/issues/6838
  test("keeps nearest-edge scrolling after real focus movement", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Filterable fruit");
    const watermelon = q.option("Watermelon");
    await select.click();
    await test.expect(select).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await test.expect(select).toHaveAttribute("aria-expanded", "false");

    await select.click();
    await test.expect(select).toHaveAttribute("aria-expanded", "true");
    await test.expect
      .poll(async () => Math.abs(await getCenterOffset(watermelon)))
      .toBeLessThanOrEqual(1);
    await test.expect(q.combobox("Search Filterable fruit")).toBeFocused();
    const firstItem = q.option("Apple");
    // Items register in an effect and publish on a later frame.
    await flushFrames(page);

    // Moving to the first item scrolls it flush to the nearest edge, just below
    // the search input. Re-centering it would scroll all the way to the top.
    await page.keyboard.press("ArrowDown");
    await test.expect(firstItem).toHaveAttribute("data-active-item");
    await test.expect(firstItem).toBeFocused();
    await test.expect
      .poll(async () => Math.abs(await getTopOffset(firstItem)))
      .toBeLessThanOrEqual(1);
  });

  // https://github.com/ariakit/ariakit/issues/6838
  test("keeps nearest-edge scrolling after virtual focus movement", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Virtual focus fruit");
    const watermelon = q.option("Watermelon");
    await select.click();
    await test.expect(select).toHaveAttribute("aria-expanded", "true");
    await test.expect
      .poll(async () => Math.abs(await getCenterOffset(watermelon)))
      .toBeLessThanOrEqual(1);

    const scrollTop = await watermelon.evaluate(
      (element) => element.closest<HTMLElement>("[role=listbox]")?.scrollTop,
    );
    await page.keyboard.press("ArrowUp");
    const strawberry = q.option("Strawberry");
    await test.expect(strawberry).toHaveAttribute("data-active-item");
    await test.expect(q.combobox("Search Virtual focus fruit")).toBeFocused();
    // The active and focused states settle before a stale presentation pass
    // would run, so wait through that checkpoint before comparing scrollTop.
    await flushFrames(page, 3);
    test
      .expect(
        await strawberry.evaluate(
          (element) =>
            element.closest<HTMLElement>("[role=listbox]")?.scrollTop,
        ),
      )
      .toBe(scrollTop);
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
});

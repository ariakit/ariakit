import type { Locator } from "@playwright/test";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

function getCenterOffset(item: Locator) {
  return item.evaluate((element) => {
    const listbox = element.closest<HTMLElement>("[role=listbox]");
    if (!listbox) return Infinity;
    const listboxRect = listbox.getBoundingClientRect();
    const itemRect = element.getBoundingClientRect();
    const viewportCenter = listboxRect.top + listbox.clientHeight / 2;
    const itemCenter = itemRect.top + itemRect.height / 2;
    return itemCenter - viewportCenter;
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

  // https://github.com/ariakit/ariakit/issues/6986
  test("centers the selected item inside its popup scrollport", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Centered fruit");
    const cherry = q.option("Cherry");
    const outer = page.getByTestId("centered-fruit-scroll-container");

    await select.scrollIntoViewIfNeeded();
    await outer.evaluate((element) => {
      element.scrollTop = 120;
    });
    await test.expect
      .poll(() => outer.evaluate((element) => element.scrollTop))
      .toBe(120);
    await select.hover();

    const initial = await page.evaluate(() => {
      const outer = document.querySelector<HTMLElement>(
        "[data-testid=centered-fruit-scroll-container]",
      );
      if (!outer) throw new Error("Missing outer scroll container");
      const events: string[] = [];
      document.addEventListener(
        "scroll",
        (event) => {
          if (
            event.target === document ||
            event.target === document.scrollingElement
          ) {
            events.push("document");
          }
          if (event.target === outer) {
            events.push("outer");
          }
        },
        true,
      );
      Object.assign(window, { compositeFocusScrollEvents: events });
      return { outer: outer.scrollTop, page: window.scrollY };
    });

    await select.click();

    const listbox = q.listbox("Centered fruit");
    await test.expect(select).toHaveAttribute("aria-expanded", "true");
    await test.expect
      .poll(() => listbox.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0);
    await test.expect
      .poll(async () => Math.abs(await getCenterOffset(cherry)))
      .toBeLessThanOrEqual(1);
    await flushFrames(page, 3);

    const result = await page.evaluate(() => {
      const outer = document.querySelector<HTMLElement>(
        "[data-testid=centered-fruit-scroll-container]",
      );
      if (!outer) throw new Error("Missing outer scroll container");
      return {
        events: (
          window as typeof window & {
            compositeFocusScrollEvents?: string[];
          }
        ).compositeFocusScrollEvents,
        outer: outer.scrollTop,
        page: window.scrollY,
      };
    });
    test.expect(result.events).toEqual([]);
    test.expect(result.outer).toBe(initial.outer);
    test.expect(result.page).toBe(initial.page);
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
    // Three frames cross Composite's after-paint presentation callback plus
    // WebKit's scroll step before checking the viewport.
    await flushFrames(page, 3);
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

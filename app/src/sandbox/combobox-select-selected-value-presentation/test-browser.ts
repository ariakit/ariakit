import type { Locator, Page } from "@playwright/test";
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

async function activateWithoutMovingFocus(control: Locator) {
  await control.evaluate((element) => {
    if (!(element instanceof HTMLElement)) return;
    element.click();
  });
}

async function observeDocumentScroll(page: Page) {
  await page.evaluate(() => {
    const events: string[] = [];
    document.addEventListener(
      "scroll",
      (event) => {
        if (event.target === document) {
          events.push("document");
        }
        if (event.target === document.scrollingElement) {
          events.push("document-element");
        }
      },
      true,
    );
    Object.assign(window, { compositeFocusScrollEvents: events });
  });
}

function getDocumentScrollEvents(page: Page) {
  return page.evaluate(
    () =>
      (
        window as typeof window & {
          compositeFocusScrollEvents?: string[];
        }
      ).compositeFocusScrollEvents,
  );
}

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/pull/6832
  test("focuses a far item reached through typeahead", async ({ page, q }) => {
    const select = q.combobox("Selected fruit");
    const watermelon = q.option("Watermelon");
    await select.click();
    await test.expect(select).toHaveAttribute("aria-expanded", "true");
    await test.expect
      .poll(async () => Math.abs(await getCenterOffset(watermelon)))
      .toBeLessThanOrEqual(1);

    await page.keyboard.type("l");

    const lemon = q.option("Lemon");
    await test.expect(lemon).toHaveAttribute("data-active-item");
    await test.expect
      .poll(async () => Math.abs(await getTopOffset(lemon)))
      .toBeLessThanOrEqual(1);
    const scrollTop = await lemon.evaluate(
      (element) => element.closest<HTMLElement>("[role=listbox]")?.scrollTop,
    );

    await page.keyboard.type("y");

    const lychee = q.option("Lychee");
    await test.expect(lychee).toHaveAttribute("data-active-item");
    await test.expect(lychee).toBeInViewport();
    test
      .expect(
        await lychee.evaluate(
          (element) =>
            element.closest<HTMLElement>("[role=listbox]")?.scrollTop,
        ),
      )
      .toBe(scrollTop);
    await test.expect(select).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/6986
  test("keyboard opening centers the last selected value", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Selected fruit");
    const watermelon = q.option("Watermelon");

    await select.focus();
    await page.keyboard.press("Enter");

    await test.expect(select).toHaveAttribute("aria-expanded", "true");
    await test
      .expect(q.option("Apple"))
      .toHaveAttribute("aria-selected", "true");
    await test.expect(watermelon).toHaveAttribute("aria-selected", "true");
    await test.expect(watermelon).toHaveAttribute("data-active-item");
    await test.expect
      .poll(async () => Math.abs(await getCenterOffset(watermelon)))
      .toBeLessThanOrEqual(1);
    await test.expect(select).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/6986
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
    await test.expect
      .poll(async () => Math.abs(await getCenterOffset(watermelon)))
      .toBeLessThanOrEqual(1);
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
    await test.expect(select).toBeFocused();
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

  // https://github.com/ariakit/ariakit/issues/6986
  test("remounts and centers a selected item with real focus", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Filterable fruit");
    const watermelon = q.option("Watermelon");
    await select.click();
    await test.expect(select).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await test.expect(select).toHaveAttribute("aria-expanded", "false");
    await test.expect(q.listbox()).not.toBeVisible();
    await page.evaluate(() => window.scrollTo({ top: 100 }));
    await test.expect.poll(() => page.evaluate(() => window.scrollY)).toBe(100);
    // Firefox may dispatch the setup scroll event on a later rendering step.
    // Drain it before observing events caused by reopening the popup.
    await flushFrames(page);
    await observeDocumentScroll(page);

    await select.click();
    await test.expect(select).toHaveAttribute("aria-expanded", "true");

    await test.expect(q.combobox("Search Filterable fruit")).toBeFocused();
    await test.expect
      .poll(async () => Math.abs(await getCenterOffset(watermelon)))
      .toBeLessThanOrEqual(1);
    // The centered item confirms that presentation finished, but the absence
    // of a document scroll event has no positive state to await. Cross the
    // browser's remaining scroll checkpoints before asserting no side effect.
    await flushFrames(page, 3);
    test.expect(await getDocumentScrollEvents(page)).toEqual([]);
    test.expect(await page.evaluate(() => window.scrollY)).toBe(100);
  });

  // https://github.com/ariakit/ariakit/issues/6986
  test("centers the selected item that owns real focus in an unmounted popup", async ({
    q,
  }) => {
    const select = q.combobox("Real-focus unmounted fruit");
    const listbox = q.listbox("Real-focus unmounted fruit");
    const watermelon = q.option("Watermelon");
    await test.expect(listbox).toHaveCount(0);

    await select.click();

    await test.expect(select).toHaveAttribute("aria-expanded", "true");
    await test.expect(watermelon).toHaveAttribute("data-active-item");
    await test.expect(watermelon).toBeFocused();
    await test.expect
      .poll(async () => Math.abs(await getCenterOffset(watermelon)))
      .toBeLessThanOrEqual(1);
  });

  // https://github.com/ariakit/ariakit/issues/6986
  test("uses nearest alignment after real focus movement", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Filterable fruit");
    const watermelon = q.option("Watermelon");
    await select.click();
    await test.expect(select).toHaveAttribute("aria-expanded", "true");
    await test.expect
      .poll(async () => Math.abs(await getCenterOffset(watermelon)))
      .toBeLessThanOrEqual(1);
    await test.expect(q.combobox("Search Filterable fruit")).toBeFocused();
    const apple = q.option("Apple");

    await page.keyboard.press("ArrowDown");

    await test.expect(apple).toHaveAttribute("data-active-item");
    await test.expect(apple).toBeFocused();
    await test.expect
      .poll(async () => Math.abs(await getTopOffset(apple)))
      .toBeLessThanOrEqual(1);
  });

  // https://github.com/ariakit/ariakit/issues/6986
  test("uses nearest alignment after virtual focus movement", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Virtual focus fruit");
    const input = q.combobox("Search Virtual focus fruit");
    const watermelon = q.option("Watermelon");
    await select.click();
    await test.expect(select).toHaveAttribute("aria-expanded", "true");
    await test.expect
      .poll(async () => Math.abs(await getCenterOffset(watermelon)))
      .toBeLessThanOrEqual(1);
    const initialScrollTop = await watermelon.evaluate(
      (element) => element.closest<HTMLElement>("[role=listbox]")?.scrollTop,
    );

    await page.keyboard.press("ArrowUp");

    const strawberry = q.option("Strawberry");
    await test.expect(strawberry).toHaveAttribute("data-active-item");
    await test.expect(input).toBeFocused();
    await flushFrames(page, 3);
    test
      .expect(
        await strawberry.evaluate(
          (element) =>
            element.closest<HTMLElement>("[role=listbox]")?.scrollTop,
        ),
      )
      .toBe(initialScrollTop);
  });

  // https://github.com/ariakit/ariakit/issues/6986
  test("centers an item that registers after opening", async ({ q }) => {
    const select = q.combobox("Late selected fruit");
    await select.click();
    await test.expect(select).toHaveAttribute("aria-expanded", "true");

    await activateWithoutMovingFocus(
      q.button("Register Late selected fruit items"),
    );

    const watermelon = q.option("Watermelon");
    await test.expect
      .poll(async () => Math.abs(await getCenterOffset(watermelon)))
      .toBeLessThanOrEqual(1);
    await test.expect(select).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/6986
  test("navigation cancels a late selected-item presentation", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Late selected fruit");
    const listbox = q.listbox("Late selected fruit");
    await select.click();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.option("Apple")).toHaveAttribute("data-active-item");

    await activateWithoutMovingFocus(
      q.button("Register Late selected fruit items"),
    );
    await test.expect(q.option("Watermelon")).toBeVisible();
    await flushFrames(page, 3);

    await test.expect(q.option("Apple")).toHaveAttribute("data-active-item");
    await test
      .expect(q.option("Watermelon"))
      .not.toHaveAttribute("data-active-item");
    test.expect(await listbox.evaluate((element) => element.scrollTop)).toBe(0);
    await test.expect(q.option("Watermelon")).not.toBeInViewport();
    await test.expect(select).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/6986
  test("centers a default-open selected item without stealing focus", async ({
    q,
  }) => {
    const mount = q.button("Mount default-open fruit picker");
    await mount.click();

    const watermelon = q.option("Default Watermelon");
    await test.expect(q.listbox("Default-open fruit")).toBeVisible();
    await test.expect
      .poll(async () => Math.abs(await getCenterOffset(watermelon)))
      .toBeLessThanOrEqual(1);
    await test.expect(mount).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/6986
  test("centers the deprecated SelectPopover value", async ({ q }) => {
    const select = q.combobox("Legacy fruit");
    const watermelon = q.option("Legacy Watermelon");

    await select.click();

    await test.expect(select).toHaveAttribute("aria-expanded", "true");
    await test.expect(watermelon).toHaveAttribute("data-active-item");
    await test.expect
      .poll(async () => Math.abs(await getCenterOffset(watermelon)))
      .toBeLessThanOrEqual(1);
    const listbox = q.listbox("Legacy fruit");
    await test.expect(listbox).toBeFocused();
    await test
      .expect(listbox)
      .toHaveAttribute(
        "aria-activedescendant",
        (await watermelon.getAttribute("id"))!,
      );
  });

  // https://github.com/ariakit/ariakit/issues/6986
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
  // https://github.com/ariakit/ariakit/issues/6986
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

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

function getPaddedCenterOffset(item: Locator) {
  return item.evaluate((element) => {
    const listbox = element.closest<HTMLElement>("[role=listbox]");
    if (!listbox) return Infinity;
    const listboxRect = listbox.getBoundingClientRect();
    const itemRect = element.getBoundingClientRect();
    const style = getComputedStyle(listbox);
    const scaleY = listboxRect.height / listbox.offsetHeight;
    const viewportStart =
      listboxRect.top +
      (listbox.clientTop + parseFloat(style.scrollPaddingTop)) * scaleY;
    const viewportEnd =
      listboxRect.top +
      (listbox.clientTop +
        listbox.clientHeight -
        parseFloat(style.scrollPaddingBottom)) *
        scaleY;
    const viewportCenter = (viewportStart + viewportEnd) / 2;
    const itemCenter = itemRect.top + itemRect.height / 2;
    return itemCenter - viewportCenter;
  });
}

function getInlineOverflow(item: Locator) {
  return item.evaluate((element) => {
    const listbox = element.closest<HTMLElement>("[role=listbox]");
    if (!listbox) return Infinity;
    const listboxRect = listbox.getBoundingClientRect();
    const itemRect = element.getBoundingClientRect();
    const scaleX = listboxRect.width / listbox.offsetWidth;
    const viewportStart = listboxRect.left + listbox.clientLeft * scaleX;
    const viewportEnd = viewportStart + listbox.clientWidth * scaleX;
    return Math.max(
      viewportStart - itemRect.left,
      itemRect.right - viewportEnd,
      0,
    );
  });
}

function getNestedCenterOffset(item: Locator) {
  return item.evaluate((element) => {
    const scroller = element.closest<HTMLElement>(
      "[data-testid=nested-vertical-scroll]",
    );
    if (!scroller) return Infinity;
    const scrollerRect = scroller.getBoundingClientRect();
    const itemRect = element.getBoundingClientRect();
    const scaleY = scrollerRect.height / scroller.offsetHeight;
    const viewportStart = scrollerRect.top + scroller.clientTop * scaleY;
    const viewportEnd = viewportStart + scroller.clientHeight * scaleY;
    const viewportCenter = (viewportStart + viewportEnd) / 2;
    const itemCenter = itemRect.top + itemRect.height / 2;
    return itemCenter - viewportCenter;
  });
}

function renderGeometryCase(page: Page, label: string) {
  return page
    .getByRole("combobox", { name: "Geometry case" })
    .selectOption({ label });
}

withFramework(import.meta.dirname, async ({ test }) => {
  test("keeps value-less offscreen items offscreen with no selected value", async ({
    q,
  }) => {
    const select = q.combobox("Fruit");
    await select.click();
    await test.expect(select).toHaveAttribute("aria-expanded", "true");

    await test.expect(q.option("No fruit")).toHaveAttribute("data-offscreen");
  });

  test("mounts the offscreen item matching the selected value", async ({
    q,
  }) => {
    const select = q.combobox("Selected fruit");
    await select.click();
    await test.expect(select).toHaveAttribute("aria-expanded", "true");

    await test.expect(q.option("Apple")).not.toHaveAttribute("data-offscreen");
    await test
      .expect(q.option("No selected fruit"))
      .toHaveAttribute("data-offscreen");
  });

  // https://github.com/ariakit/ariakit/pull/6832
  test("focuses an item that renders after typeahead movement", async ({
    page,
    q,
  }) => {
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

  // https://github.com/ariakit/ariakit/issues/6838
  test("centers inside a transformed client scrollport", async ({
    page,
    q,
  }) => {
    await renderGeometryCase(page, "Scaled filterable fruit");
    const select = q.combobox("Scaled filterable fruit");
    const mango = q.option("Mango");
    await select.click();
    await test.expect(select).toHaveAttribute("aria-expanded", "true");
    await test.expect
      .poll(async () => Math.abs(await getCenterOffset(mango)))
      .toBeLessThanOrEqual(1);
  });

  // https://github.com/ariakit/ariakit/issues/6838
  test("centers through a horizontal-only overflow ancestor", async ({
    page,
    q,
  }) => {
    await renderGeometryCase(page, "Horizontal wrapper fruit");
    const select = q.combobox("Horizontal wrapper fruit");
    const mango = q.option("Mango");
    await select.click();

    await test.expect
      .poll(() =>
        page
          .getByTestId("horizontal-wrapper")
          .evaluate((element) => element.scrollWidth > element.clientWidth),
      )
      .toBe(true);
    await test.expect
      .poll(async () => Math.abs(await getCenterOffset(mango)))
      .toBeLessThanOrEqual(1);
    await test.expect(mango).toBeInViewport();
  });

  // https://github.com/ariakit/ariakit/issues/6838
  test("centers a transformed descendant", async ({ page, q }) => {
    await renderGeometryCase(page, "Translated item fruit");
    const select = q.combobox("Translated item fruit");
    const mango = q.option("Mango");
    await select.click();

    await test
      .expect(page.getByTestId("translated-item-wrapper"))
      .toHaveCSS("transform", "matrix(1, 0, 0, 1, 0, 100)");
    await test.expect
      .poll(async () => Math.abs(await getCenterOffset(mango)))
      .toBeLessThanOrEqual(1);
    await test.expect(mango).toBeInViewport();
  });

  // https://github.com/ariakit/ariakit/issues/6838
  test("centers within the scroll-padding viewing area", async ({
    page,
    q,
  }) => {
    await renderGeometryCase(page, "Padded filterable fruit");
    const select = q.combobox("Padded filterable fruit");
    const mango = q.option("Mango");
    await select.click();

    await test
      .expect(q.combobox("Search Padded filterable fruit"))
      .toBeFocused();
    await test.expect
      .poll(async () => Math.abs(await getPaddedCenterOffset(mango)))
      .toBeLessThanOrEqual(1);
    await test.expect(mango).toBeInViewport();
  });

  // https://github.com/ariakit/ariakit/issues/6838
  test("centers through nested vertical scroll containers", async ({
    page,
    q,
  }) => {
    await renderGeometryCase(page, "Nested vertical fruit");
    const select = q.combobox("Nested vertical fruit");
    const mango = q.option("Mango");
    const listbox = q.listbox();
    const nestedScroller = page.getByTestId("nested-vertical-scroll");
    await select.click();

    await test.expect
      .poll(() => nestedScroller.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0);
    await test.expect
      .poll(() => listbox.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0);
    await test.expect
      .poll(async () => Math.abs(await getNestedCenterOffset(mango)))
      .toBeLessThanOrEqual(1);
    await test.expect
      .poll(async () => Math.abs(await getCenterOffset(mango)))
      .toBeLessThanOrEqual(1);
    await test.expect(mango).toBeInViewport();
  });

  // https://github.com/ariakit/ariakit/issues/6838
  test("centers through hidden-overflow scroll containers", async ({
    page,
    q,
  }) => {
    await renderGeometryCase(page, "Hidden overflow fruit");
    const select = q.combobox("Hidden overflow fruit");
    const mango = q.option("Mango");
    const listbox = q.listbox();
    await select.click();

    await test.expect
      .poll(() => listbox.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0);
    await test.expect
      .poll(() => listbox.evaluate((element) => element.scrollLeft))
      .toBeGreaterThan(0);
    await test.expect
      .poll(async () => Math.abs(await getCenterOffset(mango)))
      .toBeLessThanOrEqual(1);
    await test.expect
      .poll(() => getInlineOverflow(mango))
      .toBeLessThanOrEqual(1);
    await test.expect(mango).toBeInViewport();
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

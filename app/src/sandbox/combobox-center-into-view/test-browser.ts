import type { Locator, Page } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

function getCenterOffset(item: Locator) {
  return item.evaluate((element) => {
    const listbox = element.closest<HTMLElement>(
      "[role=listbox], [data-scroll-boundary]",
    );
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

function getAssignedCenterOffset(item: Locator) {
  return item.evaluate((element) => {
    const listbox =
      element.assignedSlot?.closest<HTMLElement>("[role=listbox]");
    if (!listbox) return Infinity;
    const listboxRect = listbox.getBoundingClientRect();
    const itemRect = element.getBoundingClientRect();
    const viewportStart = listboxRect.top + listbox.clientTop;
    const viewportEnd = viewportStart + listbox.clientHeight;
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
  // https://github.com/ariakit/ariakit/issues/6838
  test("preserves an ancestor panel scroll position on open", async ({
    page,
    q,
  }) => {
    const panel = page.getByTestId("combobox-select-scroll-panel");
    const select = q.combobox("Panel fruit");
    const mango = q.option("Mango");
    await select.click();
    await test.expect(select).toHaveAttribute("aria-expanded", "true");
    await page.keyboard.press("Escape");
    await test.expect(select).toHaveAttribute("aria-expanded", "false");
    await panel.evaluate((element) => {
      element.scrollTop = 313;
    });
    await test.expect
      .poll(() => panel.evaluate((element) => element.scrollTop))
      .toBe(313);

    await select.click();

    await test.expect
      .poll(async () => Math.abs(await getCenterOffset(mango)))
      .toBeLessThanOrEqual(1);
    await test.expect
      .poll(() => panel.evaluate((element) => element.scrollTop))
      .toBe(313);
  });

  // https://github.com/ariakit/ariakit/issues/6838
  test("preserves ancestor scrolling across a shadow slot", async ({
    page,
    q,
  }) => {
    const panel = page.getByTestId("combobox-select-shadow-panel");
    const shadowScroller = page.getByTestId("combobox-select-shadow-scroller");
    const target = page.getByTestId("shadow-scroll-target");
    await panel.evaluate((element) => {
      element.scrollTop = 313;
    });
    await shadowScroller.evaluate((element) => {
      element.scrollTop = 180;
    });
    await test.expect
      .poll(() => panel.evaluate((element) => element.scrollTop))
      .toBe(313);
    await test.expect
      .poll(() => shadowScroller.evaluate((element) => element.scrollTop))
      .toBe(180);
    await q.button("Center shadow item").click();

    await test.expect
      .poll(async () => Math.abs(await getCenterOffset(target)))
      .toBeLessThanOrEqual(1);
    await test.expect
      .poll(() => shadowScroller.evaluate((element) => element.scrollTop))
      .toBe(180);
    await test.expect
      .poll(() => panel.evaluate((element) => element.scrollTop))
      .toBe(313);
  });

  // https://github.com/ariakit/ariakit/issues/6838
  test("preserves ancestor scrolling across a same-origin iframe", async ({
    page,
    q,
  }) => {
    const panel = page.getByTestId("combobox-select-iframe-panel");
    const frame = page.frameLocator("iframe[title='Combobox select frame']");
    const target = frame.getByTestId("iframe-scroll-target");
    await panel.evaluate((element) => {
      element.scrollTop = 313;
    });
    await test.expect
      .poll(() => panel.evaluate((element) => element.scrollTop))
      .toBe(313);

    await q.button("Center iframe item").click();

    await test.expect
      .poll(async () => Math.abs(await getCenterOffset(target)))
      .toBeLessThanOrEqual(1);
    await test.expect
      .poll(() => panel.evaluate((element) => element.scrollTop))
      .toBe(313);
  });

  test("centers a selected item distributed through a shadow slot", async ({
    q,
  }) => {
    const select = q.combobox("Slotted fruit");
    const mango = q.option("Mango");
    await select.click();
    await test.expect(select).toHaveAttribute("aria-expanded", "true");
    await test.expect
      .poll(() =>
        mango.evaluate((element) => {
          const listbox =
            element.assignedSlot?.closest<HTMLElement>("[role=listbox]");
          return !!listbox && !listbox.contains(element);
        }),
      )
      .toBe(true);

    await test.expect
      .poll(async () => Math.abs(await getAssignedCenterOffset(mango)))
      .toBeLessThanOrEqual(1);
    await test.expect(q.combobox("Search Slotted fruit")).toBeFocused();
  });

  test("ignores an unrelated scroll boundary", async ({ page, q }) => {
    const scroller = page.getByTestId("unrelated-boundary-scroller");
    await test.expect
      .poll(() => scroller.evaluate((element) => element.scrollTop))
      .toBe(0);

    await q.button("Center with unrelated boundary").click();

    await test.expect
      .poll(() => scroller.evaluate((element) => element.scrollTop))
      .toBe(0);
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
});

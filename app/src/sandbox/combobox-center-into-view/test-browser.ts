import type { Locator, Page } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

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

function getScrollTop(listbox: Locator) {
  return listbox.evaluate((element) => element.scrollTop);
}

const reopenActions = [
  ["on reopen", (_page: Page, select: Locator) => select.click()],
  ["on keyboard open", (page: Page) => page.keyboard.press("ArrowDown")],
] as const;

withFramework(import.meta.dirname, async ({ test, query }) => {
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
  test("preserves ancestor scrolling across a same-origin iframe", async ({
    page,
  }) => {
    const panel = page.getByTestId("combobox-select-iframe-panel");
    const frame = page.frameLocator("iframe[title='Combobox select frame']");
    const select = frame.getByRole("combobox", {
      name: "Iframe fruit",
      exact: true,
    });
    const mango = frame.getByRole("option", { name: "Mango", exact: true });
    await panel.evaluate((element) => {
      element.scrollTop = 313;
    });
    await test.expect
      .poll(() => panel.evaluate((element) => element.scrollTop))
      .toBe(313);

    await select.click();

    await test.expect(select).toHaveAttribute("aria-expanded", "true");
    await test.expect
      .poll(async () => Math.abs(await getCenterOffset(mango)))
      .toBeLessThanOrEqual(1);
    await test.expect
      .poll(() => panel.evaluate((element) => element.scrollTop))
      .toBe(313);
  });

  // https://github.com/ariakit/ariakit/issues/6838
  test("centers a selected item distributed through a shadow slot", async ({
    page,
    q,
  }) => {
    const panel = page.getByTestId("combobox-select-shadow-panel");
    const select = q.combobox("Slotted fruit");
    const mango = q.option("Mango");
    await test.expect
      .poll(() => panel.evaluate((element) => element.scrollTop))
      .toBe(313);

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
    await test.expect
      .poll(() => panel.evaluate((element) => element.scrollTop))
      .toBe(313);
    await test.expect(q.combobox("Search Slotted fruit")).toBeFocused();
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

  for (const label of [
    "Persistent select-only fruit",
    "Unmounted select-only fruit",
    "Real focus select-only fruit",
  ]) {
    test.describe(label, () => {
      // https://github.com/ariakit/ariakit/pull/6976
      test("centers a selected item that starts in view", async ({ q }) => {
        const select = q.combobox(label);
        const listbox = q.listbox(`${label} options`);
        const cherry = query(listbox).option("Cherry");

        await select.click();

        await test.expect(select).toHaveAttribute("aria-expanded", "true");
        await test.expect.poll(() => getScrollTop(listbox)).toBeGreaterThan(0);
        await test.expect
          .poll(async () => Math.abs(await getCenterOffset(cherry)))
          .toBeLessThanOrEqual(1);
      });

      // Reopening keeps focus on the select, so opening is the only signal
      // that the selection should be presented again.
      for (const [name, reopen] of reopenActions) {
        // https://github.com/ariakit/ariakit/pull/6976
        test(`centers a selected item that starts in view ${name}`, async ({
          page,
          q,
        }) => {
          const select = q.combobox(label);
          const listbox = q.listbox(`${label} options`);
          const cherry = query(listbox).option("Cherry");
          await select.click();
          await test.expect(select).toHaveAttribute("aria-expanded", "true");
          // The opening pass runs on a later frame, so wait for it before
          // resetting the scroll position it would otherwise race.
          await test.expect
            .poll(() => getScrollTop(listbox))
            .toBeGreaterThan(0);
          await listbox.evaluate((element) => element.scrollTo({ top: 0 }));
          await test.expect.poll(() => getScrollTop(listbox)).toBe(0);
          await page.keyboard.press("Escape");
          await test.expect(select).toHaveAttribute("aria-expanded", "false");
          await test.expect(select).toBeFocused();

          await reopen(page, select);

          await test.expect(select).toHaveAttribute("aria-expanded", "true");
          await test.expect
            .poll(() => getScrollTop(listbox))
            .toBeGreaterThan(0);
          await test.expect
            .poll(async () => Math.abs(await getCenterOffset(cherry)))
            .toBeLessThanOrEqual(1);
        });
      }
    });
  }
});

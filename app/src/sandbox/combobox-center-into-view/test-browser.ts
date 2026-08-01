import type { Locator, Page } from "@playwright/test";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";
import {
  getPageScrolls,
  recordPageScrolls,
} from "./page-scroll.test-helper.ts";

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
      // https://github.com/ariakit/ariakit/pull/6994
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
        // https://github.com/ariakit/ariakit/pull/6994
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

  // The popup that unmounts while hidden is left out: it has no popup to
  // present into until the open itself, so its selected item is still off
  // screen when Safari's `redirectFocusToBaseElement` fallback reaches it,
  // which scrolls the document for its own reasons before restoring it. The
  // other two browsers cover that fixture in `test-chrome-firefox.ts`.
  for (const label of [
    "Persistent select-only fruit",
    "Real focus select-only fruit",
  ]) {
    // https://github.com/ariakit/ariakit/pull/6994
    test(`centers without scrolling the page (${label})`, async ({
      page,
      q,
    }) => {
      const select = q.combobox(label);
      const listbox = q.listbox(`${label} options`);
      const cherry = query(listbox).option("Cherry");

      await page.evaluate(() => window.scrollTo({ top: 200 }));
      await test.expect
        .poll(() => page.evaluate(() => window.scrollY))
        .toBe(200);
      // Hovering first so the click doesn't have to scroll the select into
      // view, which would land inside the recording below.
      await select.hover();
      // Centering the item used to center it in the page too, then scroll the
      // page back before the next paint. That is invisible, but the page still
      // scrolls, which is enough to reveal an overlay scrollbar.
      await recordPageScrolls(page);

      await select.click();

      await test.expect(select).toHaveAttribute("aria-expanded", "true");
      await test.expect
        .poll(async () => Math.abs(await getCenterOffset(cherry)))
        .toBeLessThanOrEqual(1);
      test.expect(await getPageScrolls(page)).toEqual([]);
      test.expect(await page.evaluate(() => window.scrollY)).toBe(200);
    });
  }

  // https://github.com/ariakit/ariakit/pull/6994
  test("lets navigation win over an opening pass that is still pending", async ({
    page,
    q,
  }) => {
    const label = "Persistent select-only fruit";
    const select = q.combobox(label);
    const listbox = q.listbox(`${label} options`);
    const watermelon = query(listbox).option("Watermelon");

    // Moving to the last item while the opening pass is still waiting on its
    // frame. The pass presents the selected item, so if it survives the move
    // it scrolls right back off the item the move just went to. The move is
    // retried every frame until it takes, which lands it on the first frame
    // the popup can be navigated at all, and that is inside the window. Asking
    // for a specific frame instead is not reliable, because how many frames
    // the popup takes to become navigable varies.
    await select.focus();
    await select.evaluate((element: HTMLElement, name: string) => {
      const activeItem = () =>
        document.querySelector(
          `[role=listbox][aria-label="${name} options"] [data-active-item]`,
        );
      element.click();
      const move = () => {
        if (activeItem()?.textContent === "Watermelon") return;
        element.dispatchEvent(
          new KeyboardEvent("keydown", { key: "End", bubbles: true }),
        );
        requestAnimationFrame(move);
      };
      requestAnimationFrame(move);
    }, label);

    await test.expect(select).toHaveAttribute("aria-expanded", "true");
    await test.expect(watermelon).toHaveAttribute("data-active-item");
    // There is no positive state for the abandoned pass, so wait through the
    // frame it would have run in.
    await flushFrames(page);
    await test.expect(watermelon).toBeInViewport();
  });

  // https://github.com/ariakit/ariakit/pull/6994
  test("leaves a closing popup alone when the opening pass is still pending", async ({
    page,
    q,
  }) => {
    const label = "Leaving select-only fruit";
    const select = q.combobox(label);
    const listbox = q.listbox(`${label} options`);

    // The opening pass runs in an animation frame, so closing the popup within
    // that frame is the only way to reach it after the cycle ends. A frame
    // callback registered alongside the click runs before the one the pass
    // registers from a later effect, which orders the two reliably without
    // depending on a timer. No user interaction is this fast, so there is no
    // way to express this through the rendered experience.
    //
    // Focusing first is load-bearing: clicking an unfocused select fires a
    // focus event, and the pass that starts from it moves focus and pins its
    // scroll to the select, which is a different path from the one under test.
    await select.focus();
    await select.evaluate((element: HTMLElement) => {
      element.click();
      requestAnimationFrame(() => {
        element.dispatchEvent(
          new KeyboardEvent("keydown", { key: "Escape", bubbles: true }),
        );
      });
    });

    // The popup stays on screen through its exit transition, so a pass that
    // outlived the cycle would visibly scroll it. Closing also moves the
    // active item away from the selection, so this covers the two ways such a
    // pass is abandoned together rather than one at a time.
    await test.expect(select).toHaveAttribute("aria-expanded", "false");
    await test.expect(listbox).toBeVisible();
    await test.expect(listbox).toHaveAttribute("data-leave");
    // There is no positive state for the abandoned pass, so wait through the
    // frame it would have run in.
    await flushFrames(page);
    test.expect(await getScrollTop(listbox)).toBe(0);
  });
});

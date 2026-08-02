import type { Locator } from "@playwright/test";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

const observedScrollEvents = "data-observed-scroll-events";

function observeOwnedScroll(item: Locator) {
  return item.evaluate((element, eventsAttribute) => {
    const scrollport = element.closest<HTMLElement>("[role=listbox]");
    if (!scrollport) throw new Error("Missing owned scrollport");
    scrollport.setAttribute(eventsAttribute, "0");
    scrollport.addEventListener("scroll", () => {
      const count = Number(scrollport.getAttribute(eventsAttribute));
      scrollport.setAttribute(eventsAttribute, String(count + 1));
    });
    return scrollport.scrollTop;
  }, observedScrollEvents);
}

function getOwnedScrollState(item: Locator) {
  return item.evaluate((element, eventsAttribute) => {
    const scrollport = element.closest<HTMLElement>("[role=listbox]");
    if (!scrollport) throw new Error("Missing owned scrollport");
    return {
      events: Number(scrollport.getAttribute(eventsAttribute)),
      top: scrollport.scrollTop,
    };
  }, observedScrollEvents);
}

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/pull/6985
  test("keeps the page in place while the popup is being positioned", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Branch");
    // Counts hidden elements so a popup that stays mounted while closed is
    // still found.
    const search = q.combobox("Search branches", { includeHidden: true });
    const selected = q.option("fabric-focus-blur");

    await test.expect(select).toBeVisible();
    // The composite element is the combobox inside the popup, and the popup is
    // unmounted while closed, so it doesn't exist yet. Both halves matter: if
    // it were rendered next to the select instead, the redirect would still
    // run, but it would target an element outside the popup and go through the
    // silent path, so it couldn't move the page.
    await test.expect(search).toHaveCount(0);

    await select.scrollIntoViewIfNeeded();
    const scrollY = await page.evaluate(() => window.scrollY);
    test.expect(scrollY).toBeGreaterThan(0);

    await select.click();

    // Virtual focus: DOM focus lands on the combobox element inside the popup
    // while the selected item stays the active item.
    await test.expect(search).toBeFocused();
    await test.expect(selected).toHaveAttribute("data-active-item");
    // Only the document scroll is preserved. The popup's own scroller still
    // moves to present the selected item.
    await test.expect(selected).toBeInViewport();

    // Read the scroll position once instead of retrying. The coordinated focus
    // call prevents native scrolling, so the page never moves in the first
    // place. A retrying assertion would also accept a visible jump corrected
    // later.
    test.expect(await page.evaluate(() => window.scrollY)).toBe(scrollY);
  });

  // https://github.com/ariakit/ariakit/issues/6986
  test("does not scroll outside an unmounted popup while opening", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Nested branch");
    const search = q.combobox("Search nested branches", {
      includeHidden: true,
    });
    const selected = q.option("fabric-focus-blur");
    const outer = page.getByTestId("branch-scroll-container");

    await select.scrollIntoViewIfNeeded();
    await outer.evaluate((element) => {
      element.scrollTop = 360;
    });
    await test.expect
      .poll(() => outer.evaluate((element) => element.scrollTop))
      .toBe(360);
    await select.hover();

    const initial = await page.evaluate(() => {
      const outer = document.querySelector<HTMLElement>(
        "[data-testid=branch-scroll-container]",
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
    test.expect(initial.outer).toBeGreaterThan(0);
    test.expect(initial.page).toBeGreaterThan(0);

    await select.click();

    await test.expect(search).toBeFocused();
    await test.expect(selected).toHaveAttribute("data-active-item");
    await test.expect(selected).toBeInViewport();
    await flushFrames(page, 3);

    const result = await page.evaluate(() => {
      const outer = document.querySelector<HTMLElement>(
        "[data-testid=branch-scroll-container]",
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
  test("waits for positioning and abandons focus when ownership leaves", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Delayed branch");
    const search = q.combobox("Search delayed branches", {
      includeHidden: true,
    });
    const selected = q.option("fabric-focus-blur");
    const leave = q.button("Leave and release positioning");

    await select.click();

    await test.expect(q.text("Positioning: yes")).toBeVisible();
    await test.expect(select).toBeFocused();
    await test.expect(search).not.toBeFocused();
    const initialScrollTop = await observeOwnedScroll(selected);
    test.expect(initialScrollTop).toBe(0);

    await leave.click();

    await test.expect(q.text("Positioning: no")).toBeVisible();
    await flushFrames(page, 3);
    await test.expect(leave).toBeFocused();
    await test.expect(search).not.toBeFocused();
    test.expect(await getOwnedScrollState(selected)).toEqual({
      events: 0,
      top: initialScrollTop,
    });
  });

  // https://github.com/ariakit/ariakit/issues/6986
  test("does not override focus moved inside a positioning popup", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Delayed branch");
    const search = q.combobox("Search delayed branches", {
      includeHidden: true,
    });
    const selected = q.option("fabric-focus-blur");
    const keepFocus = q.button("Keep focus and release positioning");

    await select.click();

    await test.expect(q.text("Positioning: yes")).toBeVisible();
    await test.expect(select).toBeFocused();
    const initialScrollTop = await observeOwnedScroll(selected);
    test.expect(initialScrollTop).toBe(0);

    await keepFocus.click();

    await test.expect(q.text("Positioning: no")).toBeVisible();
    await flushFrames(page, 3);
    await test.expect(keepFocus).toBeFocused();
    await test.expect(search).not.toBeFocused();
    test.expect(await getOwnedScrollState(selected)).toEqual({
      events: 0,
      top: initialScrollTop,
    });
  });

  // https://github.com/ariakit/ariakit/issues/6986
  test("lets an inline composite present into the document", async ({
    page,
    q,
  }) => {
    const first = q.button("Inline first");
    const last = q.button("Inline last");
    await first.scrollIntoViewIfNeeded();
    await first.focus();
    await test.expect(first).toBeFocused();

    const initial = await page.evaluate(() => {
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
        },
        true,
      );
      Object.assign(window, { inlineCompositeScrollEvents: events });
      return window.scrollY;
    });

    await page.keyboard.press("ArrowDown");

    await test.expect(last).toHaveAttribute("data-active-item");
    await test.expect(last).toBeFocused();
    await test.expect
      .poll(() => page.evaluate(() => window.scrollY))
      .toBeGreaterThan(initial);
    await flushFrames(page, 3);
    const events = await page.evaluate(
      () =>
        (
          window as typeof window & {
            inlineCompositeScrollEvents?: string[];
          }
        ).inlineCompositeScrollEvents,
    );
    test.expect(events).not.toEqual([]);
  });
});

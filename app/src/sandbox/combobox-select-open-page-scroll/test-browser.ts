import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

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

    // Read the scroll position once instead of retrying. The fix restores the
    // document scroll synchronously, before paint, so the page never moves for
    // the user. A retrying assertion would also accept a correction that lands
    // later, which is visible as a jump.
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
    const leave = q.button("Leave and release positioning");

    await select.click();

    await test.expect(q.text("Positioning: yes")).toBeVisible();
    await test.expect(select).toBeFocused();
    await test.expect(search).not.toBeFocused();

    await leave.click();

    await test.expect(q.text("Positioning: no")).toBeVisible();
    await flushFrames(page, 3);
    await test.expect(leave).toBeFocused();
    await test.expect(search).not.toBeFocused();
  });
});

import { withFramework } from "#app/test-utils/preview.ts";
import { recordScrollEvents } from "#app/test-utils/scroll.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/pull/6985
  // https://github.com/ariakit/ariakit/issues/6986
  test("keeps the page in place while the popup is being positioned", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Branch");
    // Counts hidden elements so the assertion below proves the composite
    // element doesn't exist yet, rather than only that it isn't exposed.
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

    const scroll = await recordScrollEvents(page);

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
    // The offset check alone passes for an implementation that scrolls the page
    // and scrolls it back within the same task. That still fires a document
    // scroll event, which the user sees as an overlay scrollbar flash, so the
    // movement has to be prevented rather than undone.
    test.expect(await scroll.events()).not.toContain("document");
  });

  // https://github.com/ariakit/ariakit/issues/6986
  test("keeps the page in place when the composite element changes while opening", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Recommended");
    const search = q.combobox("Search recommended branches");
    const recommended = q.option("fabric-focus-blur");

    await select.scrollIntoViewIfNeeded();
    const scrollY = await page.evaluate(() => window.scrollY);
    test.expect(scrollY).toBeGreaterThan(0);

    const scroll = await recordScrollEvents(page);

    await select.click();

    // The option focuses itself while the popup is still unpositioned, and
    // virtual focus hands that focus to the combobox inside the popup.
    await test.expect(search).toBeFocused();
    await test.expect(recommended).toHaveAttribute("data-active-item");
    await test.expect(recommended).toBeInViewport();

    test.expect(await page.evaluate(() => window.scrollY)).toBe(scrollY);
    test.expect(await scroll.events()).not.toContain("document");
  });

  // https://github.com/ariakit/ariakit/issues/6623
  // https://github.com/ariakit/ariakit/issues/6986
  test("keeps the page in place when the composite element registers late", async ({
    page,
    q,
  }) => {
    const open = q.button("Deferred");
    const search = q.combobox("Search deferred branches");
    const recommended = q.option("fabric-focus-blur");

    await open.scrollIntoViewIfNeeded();
    const scrollY = await page.evaluate(() => window.scrollY);
    test.expect(scrollY).toBeGreaterThan(0);

    const scroll = await recordScrollEvents(page);

    await open.click();

    // The option focuses itself in the same commit that mounts the search
    // field, so there is no composite element to hand focus to yet. The handoff
    // waits for one, and lands while the popup is still unpositioned.
    await test.expect(search).toBeFocused();
    await test.expect(recommended).toHaveAttribute("data-active-item");
    await test.expect(recommended).toBeInViewport();

    test.expect(await page.evaluate(() => window.scrollY)).toBe(scrollY);
    test.expect(await scroll.events()).not.toContain("document");
  });

  // https://github.com/ariakit/ariakit/issues/6986
  test("keeps the page in place when the popup stays mounted while closed", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Persistent");
    const search = q.combobox("Search persistent branches");
    const selected = q.option("fabric-focus-blur");

    // Focus enters while the popup is closed. A popup that is only hidden while
    // closed never finishes positioning, so nothing that waits on positioning
    // may be left waiting from here.
    await select.focus();
    await test.expect(select).toBeFocused();

    await select.scrollIntoViewIfNeeded();
    const scrollY = await page.evaluate(() => window.scrollY);
    test.expect(scrollY).toBeGreaterThan(0);

    const scroll = await recordScrollEvents(page);

    await page.keyboard.press("ArrowDown");

    await test.expect(search).toBeFocused();
    await test.expect(selected).toHaveAttribute("data-active-item");
    await test.expect(selected).toBeInViewport();

    test.expect(await page.evaluate(() => window.scrollY)).toBe(scrollY);
    test.expect(await scroll.events()).not.toContain("document");
  });
});

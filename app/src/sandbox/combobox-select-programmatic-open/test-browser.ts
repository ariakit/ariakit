import { flushFrames, withFramework } from "#app/test-utils/preview.ts";
import { expectVerticallyCentered } from "#app/test-utils/scroll.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7068
  test("takes focus when opened without focus", async ({ page, q }) => {
    await test.expect(page.locator("body")).toBeFocused();

    await page.keyboard.press("F2");

    await test.expect(q.listbox()).toBeVisible();
    await test.expect(q.combobox("Vegetable")).toBeFocused();
  });

  // Focus is asserted only at the end, so the presentation assertion above it
  // still runs against the unfixed behavior instead of being skipped by an
  // earlier failure.
  // https://github.com/ariakit/ariakit/issues/7068
  test("presents options that arrive after the open", async ({ page, q }) => {
    await page.keyboard.press("F2");
    await test.expect(q.listbox()).toBeVisible();
    // Pins that Onion registers after the open instead of being there all
    // along, which is the whole point of this test.
    await test.expect(q.option("Onion")).toHaveCount(0);

    await q.button("Load all vegetables").click();

    const onion = q.option("Onion");
    await test.expect(onion).toHaveAttribute("data-active-item");
    await expectVerticallyCentered(q.listbox(), onion);
    await test.expect(q.combobox("Vegetable")).toBeFocused();
  });

  // Taking focus is what moves the page, so a picker that opens outside the
  // viewport is scrolled into view rather than left where the user cannot see
  // the listbox they are now navigating.
  // https://github.com/ariakit/ariakit/issues/7068
  test("scrolls the picker into view when it opens outside the viewport", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Vegetable");
    test.expect(await page.evaluate(() => window.scrollY)).toBe(0);
    await test.expect(select).not.toBeInViewport();

    await page.keyboard.press("F2");

    await test.expect(q.listbox()).toBeVisible();
    await test.expect(select).toBeInViewport();
    test.expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
    await test.expect(select).toBeFocused();
  });

  // A programmatic open is the app deciding to show the popup, so it takes
  // focus like an interactive one instead of deferring to whoever held it.
  // https://github.com/ariakit/ariakit/issues/7068
  test("takes focus even when another element owns it", async ({ page, q }) => {
    const note = q.textbox("Note");
    await note.click();
    await test.expect(note).toBeFocused();

    await page.keyboard.press("F2");

    await test.expect(q.listbox()).toBeVisible();
    await test.expect(q.combobox("Vegetable")).toBeFocused();
  });

  // The select is the only control for this popup, so it stays the element that
  // announces the open state no matter who held focus when the open happened.
  // https://github.com/ariakit/ariakit/issues/7080
  test("announces the select as expanded when another element owns focus", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Vegetable");
    const note = q.textbox("Note");
    await note.click();
    await test.expect(note).toBeFocused();
    await test.expect(select).toHaveAttribute("aria-expanded", "false");

    await page.keyboard.press("F2");

    await test.expect(q.listbox()).toBeVisible();
    await test.expect(select).toHaveAttribute("aria-expanded", "true");
  });

  // https://github.com/ariakit/ariakit/issues/7068
  test("abandons the presentation when focus leaves before the options arrive", async ({
    page,
    q,
  }) => {
    await page.keyboard.press("F2");
    await test.expect(q.combobox("Vegetable")).toBeFocused();
    // The presentation is still waiting for its target, which is what makes
    // the focus move below an abandonment rather than a no-op.
    await test.expect(q.option("Onion")).toHaveCount(0);

    await q.textbox("Note").click();
    await q.button("Load all vegetables").click();

    await test.expect(q.option("Onion")).toHaveAttribute("data-active-item");
    await test.expect(q.listbox()).toBeVisible();

    // An abandoned presentation has no positive state for its cancellation, so
    // cross the registration's frame checkpoint before sampling.
    await flushFrames(page);
    await test.expect(q.textbox("Note")).toBeFocused();
    await test.expect(q.listbox()).toHaveJSProperty("scrollTop", 0);
  });
});

import type { query } from "@ariakit/test/playwright";
import type { Page } from "@playwright/test";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

type Query = ReturnType<typeof query>;

withFramework(import.meta.dirname, async ({ test }) => {
  /**
   * Reopens the panel, puts DOM focus on a plain button inside it, then loads
   * the recent files entry. Registering that item is the store update that
   * would wake a presentation the dismissed panel left behind, and focus being
   * inside the panel again is what lets that presentation move focus.
   */
  const loadRecentFilesWithFocusInside = async (q: Query, page: Page) => {
    await q.button("Show shortcuts").click();
    const editShortcuts = q.button("Edit shortcuts");
    await editShortcuts.focus();
    // Clicked through the DOM so the click doesn't move focus out of the panel.
    await q.button("Load recent files").evaluate((element) => {
      if (element instanceof HTMLElement) element.click();
    });
    await test.expect(q.button("Recent files")).toBeVisible();
    // An abandoned presentation has no positive state, so wait through the
    // checkpoint where the focus move would have landed. The item registers in
    // a passive effect, which React flushes in a later scheduler task.
    await flushFrames(page);
    return editShortcuts;
  };

  /**
   * Dismisses the panel the way that strands a presentation, then reopens it
   * with the recent files entry registered and active, the panel scrolled to
   * the top, and DOM focus outside the panel. That is the starting state for a
   * presentation that should still happen.
   */
  const reopenWithRecentFilesLoaded = async (q: Query) => {
    await q.button("Focus and hide shortcuts synchronously").click();
    await q.button("Show shortcuts").click();
    await q.button("Load recent files").click();
    const panel = q.toolbar("Shortcuts");
    await test
      .expect(q.button("Recent files"))
      .toHaveAttribute("data-active-item");
    test.expect(await panel.evaluate((element) => element.scrollTop)).toBe(0);
    return panel;
  };

  test("keeps focus after the panel is hidden in a later task", async ({
    page,
    q,
  }) => {
    await q.toolbar("Shortcuts").focus();
    await q.button("Hide shortcuts").click();

    const editShortcuts = await loadRecentFilesWithFocusInside(q, page);
    await test.expect(editShortcuts).toBeFocused();
  });

  test("keeps focus after the panel is hidden by the handler that focused it", async ({
    page,
    q,
  }) => {
    await q.button("Focus and hide shortcuts").click();

    const editShortcuts = await loadRecentFilesWithFocusInside(q, page);
    await test.expect(editShortcuts).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/7024
  test("keeps focus after the panel is hidden synchronously", async ({
    page,
    q,
  }) => {
    await q.button("Focus and hide shortcuts synchronously").click();

    const editShortcuts = await loadRecentFilesWithFocusInside(q, page);
    await test.expect(editShortcuts).toBeFocused();
  });

  // https://github.com/ariakit/ariakit/issues/7024
  test("keeps focus after tabbing into a panel that hides itself", async ({
    page,
    q,
  }) => {
    const arm = q.button("Hide shortcuts on focus");
    await arm.click();
    await test.expect(arm).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(q.toolbar("Shortcuts")).toBeHidden();

    const editShortcuts = await loadRecentFilesWithFocusInside(q, page);
    await test.expect(editShortcuts).toBeFocused();
  });

  // Refusing to present after the panel goes away must not outlive the panel
  // itself, so the two presentations a reopened panel schedules are pinned
  // here: the one its own focus handler queues, and the one a programmatic
  // move requests. The scroll is what discriminates, because the entry is
  // already the active item before either action.
  test("presents the active item when the reopened panel is focused", async ({
    q,
  }) => {
    const panel = await reopenWithRecentFilesLoaded(q);

    await panel.focus();

    await test.expect
      .poll(() => panel.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0);
    await test.expect(panel).toBeFocused();
  });

  test("presents the active item when a move targets the reopened panel", async ({
    q,
  }) => {
    const panel = await reopenWithRecentFilesLoaded(q);

    await q.button("Highlight recent files").click();

    await test.expect
      .poll(() => panel.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0);
    await test.expect(panel).toBeFocused();
  });
});

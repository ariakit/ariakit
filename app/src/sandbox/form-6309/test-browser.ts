import { gotoAndSettle, withFramework } from "#app/test-utils/preview.ts";

// Reproduces https://github.com/ariakit/ariakit/issues/6309
withFramework(import.meta.dirname, async ({ test }) => {
  test("auto-save completes while the tab is hidden", async ({ q, page }) => {
    // Real browsers pause `requestAnimationFrame` while the document is hidden
    // but keep timers running. Playwright can't background a tab — its focus
    // emulation forces hidden tabs to stay visible, which masks the bug — so
    // recreate the browser's own behavior: install (before the app loads, so
    // userland code and the form store see it) a `requestAnimationFrame` that
    // stops firing while `document.hidden` is true. The store's `submit()` awaits
    // a frame internally, so it must still complete through a timeout fallback
    // instead of stalling on "Saving" forever.
    await page.addInitScript(() => {
      const native = window.requestAnimationFrame.bind(window);
      window.requestAnimationFrame = (callback) =>
        document.hidden ? 0 : native(callback);
    });
    // Re-navigate so the init script applies before the app loads.
    await gotoAndSettle(page, page.url());
    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", {
        configurable: true,
        get: () => true,
      });
    });
    // The auto-save listener attaches when the island hydrates, which
    // `gotoAndSettle` doesn't strictly guarantee, so re-fire `visibilitychange`
    // until it runs the save (the status leaves "Idle"). The save must then
    // reach "Saved" rather than stall on "Saving".
    await test
      .expect(async () => {
        await page.evaluate(() => {
          document.dispatchEvent(new Event("visibilitychange"));
        });
        await test.expect(q.status()).not.toHaveText("Idle", { timeout: 250 });
      })
      .toPass();
    await test.expect(q.status()).toHaveText("Saved");
  });
});

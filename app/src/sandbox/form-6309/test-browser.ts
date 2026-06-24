import { withFramework } from "#app/test-utils/preview.ts";

// Reproduces https://github.com/ariakit/ariakit/issues/6309
withFramework(import.meta.dirname, async ({ test }) => {
  test("auto-save completes while the tab is hidden", async ({ q, page }) => {
    // A backgrounded tab reports `document.hidden` and pauses
    // `requestAnimationFrame` (callbacks never fire until it's foregrounded
    // again) while timers keep running. Playwright can't truly background the
    // tab — its focus emulation forces hidden tabs to stay visible, which masks
    // the bug — so recreate the same conditions the browser creates: report the
    // document as hidden and stop animation frames from firing, then dispatch
    // `visibilitychange` to run the auto-save. The form store's `submit()` awaits
    // a frame internally, so it must still complete through a timeout fallback
    // instead of stalling on "Saving" forever.
    await test.expect(q.status()).toHaveText("Idle");
    await page.evaluate(() => {
      Object.defineProperty(document, "hidden", {
        configurable: true,
        get: () => true,
      });
      window.requestAnimationFrame = () => 0;
      document.dispatchEvent(new Event("visibilitychange"));
    });
    await test.expect(q.status()).toHaveText("Saved");
  });
});

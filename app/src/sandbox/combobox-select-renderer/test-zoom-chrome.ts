import { test } from "#app/test-utils/fixtures.ts";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

// The launch scale makes Chromium round scroll positions to device pixels.
// Context deviceScaleFactor alone only changes rasterization.
test.use({
  launchOptions: { args: ["--force-device-scale-factor=0.75"] },
  deviceScaleFactor: 0.75,
  viewport: { width: 900, height: 700 },
});

withFramework(import.meta.dirname, async ({ test }) => {
  for (const renderer of ["ComboboxRenderer", "SelectRenderer"]) {
    test.describe(renderer, () => {
      test.beforeEach(async ({ q }) => {
        if (renderer === "SelectRenderer") {
          await q.button("Use SelectRenderer").click();
        }
      });

      for (const height of [199, 203]) {
        // https://github.com/ariakit/ariakit/issues/7803
        test(`keeps a far move in view at scale 0.75 with a ${height}px popup`, async ({
          page,
          q,
        }) => {
          await page.addStyleTag({
            content: `.mixed-size-popover { max-height: ${height}px; }`,
          });
          await q.combobox("Zoomed country").click();
          await test
            .expect(q.listbox("Zoomed country"))
            .not.toHaveAttribute("data-placing");
          // Placement ends before the renderer measures the initial window. Let
          // those measurements establish the estimate for the far move.
          await flushFrames(page);

          await page.keyboard.press("u");
          const uganda = q.option("Uganda");
          await test.expect(uganda).toHaveAttribute("data-active-item");
          await test.expect(q.option("Australia")).toHaveCount(0);
          // The first window is gone, but the new window must be measured and
          // its changed offsets processed before visibility can be checked.
          await flushFrames(page);

          await test.expect(uganda).toBeInViewport({ ratio: 0.95 });
        });
      }
    });
  }
});

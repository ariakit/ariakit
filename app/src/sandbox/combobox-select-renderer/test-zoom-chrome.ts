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

  // https://github.com/ariakit/ariakit/issues/7803
  test("keeps a far grid move in view at scale 0.75", async ({ page, q }) => {
    await page.addStyleTag({
      content: ".measured-grid-scroller { width: 197px; height: 197px; }",
    });
    const first = q.gridcell("1, 1");
    const last = q.gridcell("48, 48");
    await first.click();
    await test.expect(first).toBeFocused();
    // Let the resized viewport and initial cells establish the size estimates.
    await flushFrames(page);
    await page.keyboard.press("Control+End");
    await test.expect(last).toBeFocused();
    await test.expect(q.gridcell("2, 1")).toHaveCount(0);
    // The row window measures first; its nested cell window then renders and
    // measures. Each window needs a scroll frame and a measurement frame.
    await flushFrames(page, 4);
    await test.expect(last).toBeInViewport({ ratio: 0.95 });
  });

  for (const distance of [0, 4]) {
    // https://github.com/ariakit/ariakit/issues/7803
    test(`preserves a scroll with the active row ${distance}px past the edge at scale 0.75`, async ({
      page,
      q,
    }) => {
      // A half-pixel growth stays within device-pixel rounding at the edge. The
      // second case leaves the row clearly outside that tolerance.
      await page.addStyleTag({
        content: "#zoomed-row-1 { max-height: 40.5px; }",
      });
      const scroller = q.region("Zoomed rows");
      const row = q.option("Zoomed row 11");
      await test.expect(row).toHaveAttribute("data-active-item");
      await scroller.scrollIntoViewIfNeeded();
      await test.expect(row).toHaveCSS("top", "400px");
      // Like a scrollbar drag, this scroll has no wheel event to release the
      // anchor. Its position therefore tests the visibility checks directly.
      const scrollTop = await row.evaluate((element, distance) => {
        const list = element.closest<HTMLElement>("[role=region]");
        if (!list) return Number.NaN;
        if (!("offsetTop" in element)) return Number.NaN;
        list.scrollTop =
          element.offsetTop +
          element.offsetHeight -
          list.clientHeight -
          distance;
        return list.scrollTop;
      }, distance);
      test.expect(scrollTop).toBeGreaterThan(0);
      const top = await row.evaluate(
        (element) => getComputedStyle(element).top,
      );
      await q.button("Expand the first zoomed row").click();
      await test.expect(row).not.toHaveCSS("top", top);
      test
        .expect(await scroller.evaluate((element) => element.scrollTop))
        .toBe(scrollTop);
    });
  }
});

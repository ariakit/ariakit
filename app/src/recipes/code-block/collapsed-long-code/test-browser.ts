import {
  forEachColorScheme,
  getCapture,
  hoverOver,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ id, test }) => {
  // The copy button and the expand button stand on the code, so they lighten
  // from the page like the code, not from a darker strip color.
  test("shows the collapsed code @visual", async ({ page, q, visual }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      await test.expect(q.button("Show all 36 lines")).toBeVisible();
      await visual(
        getCapture(page.locator(".code-block"), colorScheme, {
          item: `${id}/collapsed`,
        }),
      );
    });
  });

  test("shows the hover state of the expand button over the code @visual", async ({
    page,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      // The pointer is on the first lines, far from the button, where only the
      // click target over the code is hovered.
      await hoverOver(page.locator(".code-block-expand"), { x: 80, y: 40 });
      await visual(
        getCapture(page.locator(".code-block"), colorScheme, {
          item: `${id}/collapsed-hover`,
        }),
      );
    });
  });

  test("shows the collapse button under the expanded code @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      // The expanded block scrolls into view smoothly, and the capture would
      // start during the scroll.
      await page.emulateMedia({ reducedMotion: "reduce" });
      await q.button("Show all 36 lines").click();
      await test
        .expect(q.button("Show fewer lines"))
        .toBeInViewport({ ratio: 1 });
      await visual(
        getCapture(page.locator(".code-block"), colorScheme, {
          item: `${id}/expanded`,
        }),
      );
    });
  });
});

import {
  capturePage,
  forEachColorScheme,
  getCapture,
  hoverOver,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  test("keeps a single-digit trailing badge square", async ({ page, q }) => {
    const label = query(q.article("Trailing badge")).text("3");
    await test.expect(label).toBeVisible();
    await page.evaluate(() => document.fonts.ready);
    await test.expect
      .poll(() =>
        label.evaluate((element) => {
          const slot = element.parentElement;
          if (!slot) {
            throw new Error("Badge slot not found");
          }
          const { width, height } = slot.getBoundingClientRect();
          return Math.abs(width - height);
        }),
      )
      .toBeLessThan(1);
  });

  test("page @visual", async ({ page, visual }) => {
    await forEachColorScheme(page, (colorScheme) =>
      capturePage(page, visual, colorScheme),
    );
  });

  // https://github.com/ariakit/ariakit/issues/7478
  test("default shape on hover @visual", async ({ page, q, visual }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Default");
      const button = query(box).button("What is Ariakit?");
      await button.click();
      await test.expect(button).toHaveAttribute("aria-expanded", "false");
      // Center before hovering so the capture does not move the button away
      // from the pointer.
      // https://github.com/ariakit/ariakit/pull/7494#discussion_r3995263559
      await box.evaluate((node) => node.scrollIntoView({ block: "center" }));
      await hoverOver(button);
      await visual(getCapture(box, colorScheme));
      await test.expect
        .poll(() => button.evaluate((node) => node.matches(":hover")))
        .toBe(true);
    });
  });
});

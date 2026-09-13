import {
  captureInView,
  capturePage,
  expectFocusVisible,
  forEachColorScheme,
  getCapture,
  hoverOver,
  tabTo,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  for (const title of ["Groups", "Right to left groups"]) {
    test(`keeps the short numeric badge round in ${title}`, async ({
      page,
      q,
    }) => {
      const label = query(q.article(title)).text("12");
      await test.expect(label).toBeVisible();
      await page.evaluate(() => document.fonts.ready);
      await test.expect
        .poll(() =>
          label.evaluate((element) => {
            const slot = element.closest(".control-slot");
            if (!slot) {
              throw new Error("Badge slot not found");
            }
            const { width, height } = slot.getBoundingClientRect();
            return Math.abs(width - height);
          }),
        )
        .toBeLessThan(1);
    });
  }

  // The page capture also keeps the custom navigation label styles of the nav
  // fixtures under visual regression.
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972223730
  test("page @visual", async ({ page, visual }) => {
    await forEachColorScheme(page, (colorScheme) =>
      capturePage(page, visual, colorScheme),
    );
  });

  // The nested section's root sits in a content that stacks over the gliders,
  // so it must not paint a surface of its own over them.
  test("shows the hover cover on a row of a nested section @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Nested disclosures");
      await hoverOver(query(box).link("Radio"));
      await visual(getCapture(box, colorScheme));
    });
  });

  test("moves the sidebar current cover on click and the focus ring with the keyboard @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Sidebar");
      const quickstart = query(box).link("Quickstart").first();
      await quickstart.click();
      await test.expect(quickstart).toHaveAttribute("aria-current", "page");
      const introduction = query(box).link("Introduction").nth(1);
      await tabTo(page, introduction);
      await expectFocusVisible(introduction);
      await captureInView(visual, box, colorScheme);
    });
  });
});

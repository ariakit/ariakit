import {
  captureInView,
  captureSections,
  expectFocusVisible,
  forEachColorScheme,
  getCapture,
  hoverOver,
  tabTo,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  for (const kind of ["folder", "flat", "bevel"]) {
    // https://github.com/ariakit/ariakit/issues/7482
    test(`keeps a phrasing label truncated in a ${kind} tab`, async ({ q }) => {
      const box = query(q.article(`${kind} tab with a long label`));
      const tab = box.tab("Project settings and permissions");
      const label = query(tab).text("Project settings and permissions");
      await test.expect(label).toHaveJSProperty("tagName", "SPAN");
      await test.expect(label).toHaveCSS("text-overflow", "ellipsis");
      await test.expect(label).toHaveCSS("white-space", "nowrap");
      await test.expect(label).toHaveCSS("overflow", "hidden");
      await test.expect
        .poll(() =>
          label.evaluate((node) => node.scrollWidth > node.clientWidth),
        )
        .toBe(true);
      await test.expect(tab).toHaveAttribute("aria-selected", "true");
      await box.tab("Activity").click();
      await test.expect(tab).toHaveAttribute("aria-selected", "false");
      await test.expect
        .poll(() =>
          label.evaluate((node) => node.scrollWidth > node.clientWidth),
        )
        .toBe(true);
    });
  }

  test("sections @visual", async ({ page, visual }) => {
    await forEachColorScheme(page, (colorScheme) =>
      captureSections(page, visual, colorScheme),
    );
  });

  test("moves the hover glider over a hovered tab @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Folder glider");
      // A synthesized pointer move that scrolls the strip into view does not
      // apply :hover in WebKit until the pointer enters another element, so the
      // pointer passes over Usage on its way to Preview.
      await query(box).tab("Usage").hover();
      await hoverOver(query(box).tab("Preview"));
      await visual(getCapture(box, colorScheme));
    });
  });

  test("moves the focus glider to a tab without selecting it @visual", async ({
    page,
    q,
    visual,
  }) => {
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Folder glider");
      const usage = query(box).tab("Usage");
      // Firefox leaves the modality of a click in place when an arrow key moves
      // focus, so the strip is reached with the keyboard.
      await tabTo(page, query(box).tab("Code"));
      await page.keyboard.press("ArrowRight");
      await expectFocusVisible(usage);
      await test.expect(usage).toHaveAttribute("aria-selected", "false");
      await captureInView(visual, box, colorScheme);
    });
  });
});

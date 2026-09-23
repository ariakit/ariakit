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
import { setVisonautItem } from "#app/test-utils/visonaut.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  test("page @visual", async ({ page, visual }) => {
    setVisonautItem("ui/tabs/test-browser/page");
    await forEachColorScheme(page, (colorScheme) =>
      capturePage(page, visual, colorScheme),
    );
  });

  test("moves the hover glider over a hovered tab @visual", async ({
    page,
    q,
    visual,
  }) => {
    setVisonautItem(
      "ui/tabs/test-browser/moves-the-hover-glider-over-a-hovered-tab",
    );
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Folder glider");
      // In WebKit, a synthesized move that scrolls the strip does not apply
      // :hover until the pointer enters another element. Move across Usage.
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
    setVisonautItem(
      "ui/tabs/test-browser/moves-the-focus-glider-to-a-tab-without-selecting-it",
    );
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Folder glider");
      const usage = query(box).tab("Usage");
      // Firefox retains click modality after an arrow key moves focus. Reach
      // the strip with the keyboard first.
      await tabTo(page, query(box).tab("Code"));
      await page.keyboard.press("ArrowRight");
      await expectFocusVisible(usage);
      await test.expect(usage).toHaveAttribute("aria-selected", "false");
      await captureInView(visual, box, colorScheme);
    });
  });
});

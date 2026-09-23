import {
  capturePage,
  forEachColorScheme,
  getCapture,
  hoverOver,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";
import { setVisonautItem } from "#app/test-utils/visonaut.ts";

withCaptures(import.meta.dirname, async ({ query, test }) => {
  test("page @visual", async ({ page, visual }) => {
    setVisonautItem("ui/radio/test-browser/page");
    await forEachColorScheme(page, (colorScheme) =>
      capturePage(page, visual, colorScheme),
    );
  });

  test("lights an enabled card on hover @visual", async ({
    page,
    q,
    visual,
  }) => {
    setVisonautItem("ui/radio/test-browser/lights-an-enabled-card-on-hover");
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Cards");
      // The card is the label around the hidden input.
      await hoverOver(
        query(box)
          .radio(/^Hobby/)
          .locator("xpath=.."),
      );
      await visual(getCapture(box, colorScheme));
    });
  });

  test("keeps a card of a disabled grid unlit on hover @visual", async ({
    page,
    q,
    visual,
  }) => {
    setVisonautItem(
      "ui/radio/test-browser/keeps-a-card-of-a-disabled-grid-unlit-on-hover",
    );
    await forEachColorScheme(page, async (colorScheme) => {
      const box = q.article("Disabled card grid");
      await hoverOver(
        query(box)
          .radio(/^Hobby/)
          .locator("xpath=.."),
      );
      await visual(getCapture(box, colorScheme));
    });
  });
});

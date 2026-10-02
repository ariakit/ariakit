import type { Locator } from "@playwright/test";
import {
  capturePage,
  forEachColorScheme,
  withCaptures,
} from "#app/test-utils/ariakit-ui.ts";

// Where the text of a padded box starts: its left edge plus its side padding.
function textStart(box: Locator) {
  return box.evaluate((element) => {
    const { left } = element.getBoundingClientRect();
    return left + Number.parseFloat(getComputedStyle(element).paddingLeft);
  });
}

withCaptures(import.meta.dirname, async ({ query, test }) => {
  test("page @visual", async ({ page, visual }) => {
    await forEachColorScheme(page, (colorScheme) =>
      capturePage({
        page,
        visual,
        colorScheme,
        item: "ariakit-ui-text-frame/page",
      }),
    );
  });

  // The optical side padding depends on the font metrics of each engine, so the
  // alignment is checked in every desktop project.
  test("starts its text where a button label starts", async ({ q }) => {
    const box = query(q.article("Section label"));
    const labelStart = await textStart(box.text("Workspace"));
    const buttonLabel = await box.text("Inbox").boundingBox();
    test.expect(buttonLabel).not.toBeNull();
    test.expect(Math.abs(labelStart - (buttonLabel?.x ?? 0))).toBeLessThan(0.5);

    // A plain frame with the same padding starts its text at the frame padding
    // alone, which is closer to the edge by the optical extra.
    const frameStart = await textStart(box.text("Archive"));
    test.expect(labelStart - frameStart).toBeGreaterThan(1);
  });
});

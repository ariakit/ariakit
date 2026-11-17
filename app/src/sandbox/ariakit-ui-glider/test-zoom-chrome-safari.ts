import { withFramework } from "#app/test-utils/preview.ts";
import { getBoxOffset, getItemsToScale } from "./test-helpers.ts";

// Firefox applies CSS zoom twice to the registered lengths that place the box,
// so this test runs in Chrome and Safari only.
// https://github.com/ariakit/ariakit/issues/8475
withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/8489
  test("rests the selected box on the selected item under CSS zoom", async ({
    page,
    q,
  }) => {
    await page.addStyleTag({ content: "html { zoom: 2; }" });
    for (const item of getItemsToScale(q)) {
      await item.click();
      // The boxes are measured in screen pixels, which are twice the CSS pixels
      // here, so the tolerance doubles too.
      await test.expect.poll(() => getBoxOffset(item)).toBeLessThan(1);
    }
  });
});

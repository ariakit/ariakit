import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // A small header moves its side insets by half a step, which is 3.5px at the
  // default shell size. The shell header and the main header must land on the
  // same pixel, including with a larger browser font.
  // https://github.com/ariakit/ariakit/issues/8179
  test.describe("in a narrow main column", () => {
    test.use({ viewport: { width: 700, height: 800 } });

    for (const rootSize of [16, 20, 24]) {
      test(`keeps the shell header and the main header on one edge at a ${rootSize}px root`, async ({
        page,
        q,
      }) => {
        await page.addStyleTag({
          content: `html { font-size: ${rootSize}px; }`,
        });
        const toggle = q.button("Toggle sidebar");
        const filters = q.radiogroup("Filter issues");
        await test.expect(toggle).toBeVisible();
        await test.expect(filters).toBeVisible();
        // The sidebar width follows the root font size through a transition.
        await test.expect
          .poll(async () => {
            const toggleBox = await toggle.boundingBox();
            const filtersBox = await filters.boundingBox();
            return (filtersBox?.x ?? 0) - (toggleBox?.x ?? 0);
          })
          .toBe(0);
      });
    }
  });
});

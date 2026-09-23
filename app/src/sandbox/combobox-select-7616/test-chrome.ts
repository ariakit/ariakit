import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

const labels = ["Fruit", "Vegetable"];

withFramework(import.meta.dirname, async ({ test }) => {
  for (const label of labels) {
    test.describe(label, () => {
      // https://github.com/ariakit/ariakit/issues/7616
      test("a prevented close keeps the moved item active", async ({
        page,
        q,
      }) => {
        await q.combobox(label).click();
        // Until the popup finishes entering, it stays mounted through a
        // prevented close and can still take its initial focus.
        await test.expect(q.listbox(label)).toHaveAttribute("data-enter");
        await test
          .expect(q.option(`${label} 1`))
          .toHaveAttribute("data-active-item");

        await page.keyboard.press("ArrowDown");
        await test
          .expect(q.option(`${label} 2`))
          .toHaveAttribute("data-active-item");

        await page.keyboard.press("Escape");
        await test.expect(q.listbox(label)).toBeVisible();
        // No state tracks a positioning pass that the close could restart. The
        // end of that pass would make the popup take its initial focus again,
        // so cross the frames it needs before the next move.
        await flushFrames(page);

        // The next move starts from the item that was active before Escape.
        await page.keyboard.press("ArrowDown");
        await test
          .expect(q.option(`${label} 3`))
          .toHaveAttribute("data-active-item");
      });
    });
  }
});

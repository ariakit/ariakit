import { withFramework } from "#app/test-utils/preview.ts";

const labels = ["Fruit", "Vegetable"];

withFramework(import.meta.dirname, async ({ test }) => {
  for (const label of labels) {
    test.describe(label, () => {
      // https://github.com/ariakit/ariakit/issues/7616
      test("a prevented close keeps the popup placed", async ({ page, q }) => {
        const select = q.combobox(label);
        const listbox = q.listbox(label);
        await select.click();
        // Until the popup finishes entering, it stays mounted through a
        // prevented close.
        await test.expect(listbox).toHaveAttribute("data-enter");

        // The popup starts at its unplaced origin. Wait until it's placed below
        // the select, so Escape runs on a placed popup.
        await test
          .expect(async () => {
            const selectBox = await select.boundingBox();
            const listboxBox = await listbox.boundingBox();
            if (!selectBox || !listboxBox) throw new Error("Not rendered");
            const selectBottom = selectBox.y + selectBox.height;
            test.expect(listboxBox.y).toBeGreaterThanOrEqual(selectBottom);
          })
          .toPass();

        await page.keyboard.press("Escape");
        await test.expect(listbox).toBeVisible();

        for (let i = 0; i < 15; i += 1) {
          await page.keyboard.press("ArrowDown");
        }
        const option = q.option(`${label} 16`);
        await test.expect(option).toHaveAttribute("data-active-item");
        await test.expect(option).toBeInViewport();
      });
    });
  }
});

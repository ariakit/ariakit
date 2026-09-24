import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

const labels = ["Fruit", "Vegetable", "Berry"];

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

      // https://github.com/ariakit/ariakit/issues/7616
      test("a prevented close from the select keeps the moved item active", async ({
        page,
        q,
      }) => {
        const select = q.combobox(label);
        await select.click();
        // Until the popup finishes entering, it stays mounted through a
        // prevented close and can still take its initial focus.
        await test.expect(q.listbox(label)).toHaveAttribute("data-enter");
        await page.keyboard.press("ArrowDown");
        await test
          .expect(q.option(`${label} 2`))
          .toHaveAttribute("data-active-item");

        await select.click();
        await test.expect(q.listbox(label)).toBeVisible();
        // No state tracks a positioning pass that the close could restart. The
        // end of that pass would make the popup take its initial focus again,
        // so cross the frames it needs before checking the active item.
        await flushFrames(page);
        await test
          .expect(q.option(`${label} 2`))
          .toHaveAttribute("data-active-item");
        await test.expect(q.text(`${label} closes prevented: 1`)).toBeVisible();
      });

      // https://github.com/ariakit/ariakit/issues/7616
      test("a prevented close from an outside click keeps the moved item active", async ({
        page,
        q,
      }) => {
        await q.combobox(label).click();
        // Until the popup finishes entering, it stays mounted through a
        // prevented close and can still take its initial focus.
        await test.expect(q.listbox(label)).toHaveAttribute("data-enter");
        await page.keyboard.press("ArrowDown");
        await test
          .expect(q.option(`${label} 2`))
          .toHaveAttribute("data-active-item");

        const viewport = page.viewportSize();
        if (!viewport) {
          throw new Error("The page has no viewport");
        }
        // The selects and their popups are in the middle of the page, so its
        // top-right corner is outside them.
        await page.mouse.click(viewport.width - 10, 10);
        await test.expect(q.listbox(label)).toBeVisible();
        // No state tracks a positioning pass that the close could restart. The
        // end of that pass would make the popup take its initial focus again,
        // so cross the frames it needs before checking the active item.
        await flushFrames(page);
        await test
          .expect(q.option(`${label} 2`))
          .toHaveAttribute("data-active-item");
        await test.expect(q.text(`${label} closes prevented: 1`)).toBeVisible();
      });
    });
  }
});

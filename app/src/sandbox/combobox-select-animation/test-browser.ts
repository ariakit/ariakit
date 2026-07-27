import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  for (const label of ["Favorite fruit", "Store favorite fruit"]) {
    test.describe(label, () => {
      test("preserves selection across animated show and hide", async ({
        page,
        q,
      }) => {
        const select = q.combobox(label);
        const listbox = q.listbox(label);
        await test.expect(listbox).toHaveCount(0);

        await select.click();
        await test.expect(listbox).toBeVisible();
        await test.expect(select).toBeFocused();
        await test
          .expect(q.option("Apple"))
          .toHaveAttribute("aria-selected", "true");
        await test
          .expect(q.option("Apple"))
          .toHaveAttribute("data-active-item");

        await page.keyboard.press("Escape");
        await test.expect(select).toBeFocused();
        await test.expect(listbox).toBeVisible();
        await test.expect(listbox).toHaveCount(0);

        await page.keyboard.press("Enter");
        await test
          .expect(q.option("Apple"))
          .toHaveAttribute("data-active-item");
        await page.keyboard.press("ArrowDown");
        await test
          .expect(q.option("Banana"))
          .toHaveAttribute("data-active-item");
        await page.keyboard.press("Enter");
        await test.expect(listbox).toHaveCount(0);

        await page.keyboard.press("Enter");
        await test
          .expect(q.option("Banana"))
          .toHaveAttribute("aria-selected", "true");
        await test
          .expect(q.option("Banana"))
          .toHaveAttribute("data-active-item");
      });

      test("does not scroll or misplace the first popover mount", async ({
        page,
        q,
      }) => {
        const select = q.combobox(label);
        const listbox = q.listbox(label);
        await select.focus();
        await page.evaluate(() => window.scrollTo({ top: 100 }));
        const selectBox = await select.boundingBox();
        if (!selectBox) throw new Error("Select box is missing");

        await page.keyboard.press("Enter");

        await test.expect(listbox).toBeVisible();
        const listboxBox = await listbox.boundingBox();
        if (!listboxBox) throw new Error("Listbox box is missing");
        test.expect(Math.abs(listboxBox.x - selectBox.x)).toBeLessThan(10);
        test.expect(listboxBox.y).toBeGreaterThan(selectBox.y);
        test.expect(await page.evaluate(() => window.scrollY)).toBe(100);
      });

      // https://github.com/ariakit/ariakit/issues/1684
      test("closes when pressing outside the popover", async ({ page, q }) => {
        await q.combobox(label).click();
        await page.mouse.click(1, 1);
        await test.expect(q.listbox(label)).toHaveCount(0);
      });
    });
  }
});

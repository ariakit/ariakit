import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

const labels = ["Menu", "Dialog"];

withFramework(import.meta.dirname, async ({ test }) => {
  for (const label of labels) {
    test.describe(label, () => {
      // https://github.com/ariakit/ariakit/issues/7621
      test("a prevented close from Enter on an item keeps the search and the active item", async ({
        page,
        q,
      }) => {
        await q.button(label).click();
        await test.expect(q.combobox(`${label} search`)).toBeFocused();
        await page.keyboard.type("an");
        await test
          .expect(q.option("Banana"))
          .toHaveAttribute("data-active-item");

        // Move past the first match, which autoSelect would pick again after a
        // reset.
        await page.keyboard.press("ArrowDown");
        await test
          .expect(q.option("Orange"))
          .toHaveAttribute("data-active-item");

        await page.keyboard.press("Enter");
        await test.expect(q.text(`${label} closes prevented: 1`)).toBeVisible();
        // The state below must not change. A close that went through would
        // reopen the popup, and the menu would take its initial focus again
        // after a positioning pass that no state tracks. Cross its frames.
        await flushFrames(page);
        await test.expect(q.dialog(label)).toBeVisible();
        await test.expect(q.combobox(`${label} search`)).toHaveValue("an");
        await test
          .expect(q.option("Orange"))
          .toHaveAttribute("data-active-item");
      });

      // https://github.com/ariakit/ariakit/issues/7621
      test("a prevented close from clicking an item keeps the search and the active item", async ({
        page,
        q,
      }) => {
        await q.button(label).click();
        await test.expect(q.combobox(`${label} search`)).toBeFocused();
        await page.keyboard.type("an");
        await test
          .expect(q.option("Banana"))
          .toHaveAttribute("data-active-item");

        await q.option("Orange").click();
        await test.expect(q.text(`${label} closes prevented: 1`)).toBeVisible();
        // The state below must not change. A close that went through would
        // reopen the popup, and the menu would take its initial focus again
        // after a positioning pass that no state tracks. Cross its frames.
        await flushFrames(page);
        await test.expect(q.dialog(label)).toBeVisible();
        await test.expect(q.combobox(`${label} search`)).toHaveValue("an");
        await test
          .expect(q.option("Orange"))
          .toHaveAttribute("data-active-item");
      });
    });
  }
});

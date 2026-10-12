import { expect } from "@playwright/test";
import type { Locator } from "@playwright/test";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

async function expectActiveInView(option: Locator) {
  await expect(option).toHaveAttribute("data-active-item");
  // An estimated offset can show the active item before measurements move it
  // again. Cross the scroll-task frame and the following measurement frame.
  await flushFrames(option.page());
  await expect(option).toBeInViewport({ ratio: 0.99 });
}

withFramework(import.meta.dirname, async ({ test }) => {
  for (const count of [1000, 10000]) {
    for (const mode of ["fixed", "measured", "grouped"]) {
      test.describe(`${count} items, ${mode}`, () => {
        test("select a different item and reopen", async ({ page, q }) => {
          await q.combobox("Item count").selectOption(String(count));
          await q.combobox("Layout").selectOption(mode);
          await expect(q.combobox("Choice")).toHaveText("Item 1");
          await q.combobox("Choice").click();
          await expect(q.listbox("Choices")).toBeVisible();
          await expectActiveInView(q.option("Item 1", { exact: true }));

          await page.keyboard.press("ArrowDown");
          const option = q.option("Item 2", { exact: true });
          await expectActiveInView(option);
          await page.keyboard.press("Enter");
          await expect(q.combobox("Choice")).toHaveText("Item 2");
          await expect(q.listbox("Choices")).toHaveCount(0);
          await q.combobox("Choice").click();
          await expectActiveInView(option);
        });
      });
    }
  }
});

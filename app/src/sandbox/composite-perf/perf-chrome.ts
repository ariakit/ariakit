import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("mount composite", async ({ q, perf }) => {
    const mountButton = q.button("Mount composite");
    const lastItem = q.button("Item 400");

    await perf.measure(async () => {
      await mountButton.click();
      await expect(lastItem).toBeVisible();
    });
  });

  test("move to next item", async ({ q, page, perf }) => {
    const mountButton = q.button("Mount composite");
    const firstItem = q.button("Item 1");
    const secondItem = q.button("Item 2");

    await perf.measure(
      async () => {
        await page.keyboard.press("ArrowRight");
        await expect(secondItem).toBeFocused();
      },
      {
        setup: async () => {
          await mountButton.click();
          await firstItem.focus();
          await expect(firstItem).toBeFocused();
        },
      },
    );
  });
});

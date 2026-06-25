import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

const itemCount = 400;

withFramework(import.meta.dirname, async ({ test }) => {
  test("mount composite", async ({ q, perf }) => {
    const mountButton = q.button("Mount composite");
    const lastItem = q.button(`Item ${itemCount}`);

    await perf.measure(async () => {
      await mountButton.click();
      await expect(lastItem).toBeVisible();
    });
  });

  test("move across items", async ({ q, page, perf }) => {
    const mountButton = q.button("Mount composite");
    const firstItem = q.button("Item 1");
    const lastItem = q.button(`Item ${itemCount}`);

    await perf.measure(
      async () => {
        for (let i = 1; i < itemCount; i++) {
          await page.keyboard.press("ArrowRight");
        }
        await expect(lastItem).toBeFocused();
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

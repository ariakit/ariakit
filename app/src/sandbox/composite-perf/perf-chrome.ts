import type { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

const itemCount = 400;
const updateCount = 20;
type Query = ReturnType<typeof query>;

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

  test("mount controlled composite", async ({ q, perf }) => {
    const mountButton = q.button("Mount controlled composite");
    const lastItem = q.button(`Item ${itemCount}`);

    await perf.measure(async () => {
      await mountButton.click();
      await expect(lastItem).toBeVisible();
    });
  });

  const setupControlledComposite = async (q: Query) => {
    await q.button("Mount controlled composite").click();
    await expect(q.button(`Item ${itemCount}`)).toBeVisible();
  };

  const updateControlledItems = async (q: Query) => {
    const updateButton = q.button("Update items");
    for (let i = 0; i < updateCount; i++) {
      await updateButton.click();
    }
    await expect(q.status("Updates")).toHaveText(String(updateCount));
  };

  test("update controlled items", async ({ q, perf }) => {
    await perf.measure(() => updateControlledItems(q), {
      setup: () => setupControlledComposite(q),
    });
  });

  test("update controlled items (script profile)", async ({ q, perf }) => {
    await perf.measure(() => updateControlledItems(q), {
      scriptProfile: true,
      profileLimit: 20,
      setup: () => setupControlledComposite(q),
    });
  });
});

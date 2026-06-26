import type { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

const itemCount = 400;
const updateCount = 20;
type Query = ReturnType<typeof query>;

async function mountComposite(q: Query) {
  const mountButton = q.button("Mount composite");
  const lastItem = q.button(`Item ${itemCount}`);

  await mountButton.click();
  await expect(lastItem).toBeVisible();
}

async function setupComposite(q: Query) {
  await q.button("Mount composite").click();
  await expect(q.button("Item 1")).toBeVisible();
}

async function moveAcrossItems(q: Query, page: Page) {
  const lastItem = q.button(`Item ${itemCount}`);
  for (let i = 1; i < itemCount; i++) {
    await page.keyboard.press("ArrowRight");
  }
  await expect(lastItem).toBeFocused();
}

async function setupControlledComposite(q: Query) {
  await q.button("Mount controlled composite").click();
  await expect(q.button(`Item ${itemCount}`)).toBeVisible();
}

async function updateControlledItems(q: Query) {
  const updateButton = q.button("Update items");
  for (let i = 0; i < updateCount; i++) {
    await updateButton.click();
  }
  await expect(q.status("Updates")).toHaveText(String(updateCount));
}

withFramework(import.meta.dirname, async ({ test }) => {
  test("mount composite", async ({ q, perf }) => {
    await perf.measure(async () => {
      await mountComposite(q);
    });
  });

  test("mount composite (script profile)", async ({ q, perf }) => {
    await perf.measure(
      async () => {
        await mountComposite(q);
      },
      {
        scriptProfile: true,
        profileLimit: 20,
      },
    );
  });

  test("move across items", async ({ q, page, perf }) => {
    const firstItem = q.button("Item 1");

    await perf.measure(
      async () => {
        await moveAcrossItems(q, page);
      },
      {
        setup: async () => {
          await setupComposite(q);
          await firstItem.focus();
          await expect(firstItem).toBeFocused();
        },
      },
    );
  });

  test("move across items (script profile)", async ({ q, page, perf }) => {
    const firstItem = q.button("Item 1");

    await perf.measure(
      async () => {
        await moveAcrossItems(q, page);
      },
      {
        scriptProfile: true,
        profileLimit: 20,
        setup: async () => {
          await setupComposite(q);
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

  test("update controlled items", async ({ q, perf }) => {
    await perf.measure(() => updateControlledItems(q), {
      setup: () => setupControlledComposite(q),
    });
  });
});

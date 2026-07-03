import type { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

const itemCount = 400;
const updateCount = 20;
type Query = ReturnType<typeof query>;

async function mountComposite(q: Query) {
  const mountButton = q.button("Mount composite");
  await mountButton.click();
}

async function verifyCompositeMounted(q: Query) {
  await expect(q.button(`Item ${itemCount}`)).toBeVisible();
}

async function setupComposite(q: Query) {
  await q.button("Mount composite").click();
  await expect(q.button("Item 1")).toBeVisible();
}

async function moveAcrossItems(page: Page) {
  for (let i = 1; i < itemCount; i++) {
    await page.keyboard.press("ArrowRight");
  }
}

async function verifyMovedAcrossItems(q: Query) {
  await expect(q.button(`Item ${itemCount}`)).toBeFocused();
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
}

async function verifyControlledItemsUpdated(q: Query) {
  await expect(q.status("Updates")).toHaveText(String(updateCount));
}

withFramework(import.meta.dirname, async ({ test }) => {
  test("mount composite", async ({ q, perf }) => {
    await perf.measure(() => mountComposite(q), {
      verify: () => verifyCompositeMounted(q),
    });
  });

  test("mount composite (script profile)", async ({ q, perf }) => {
    await perf.measure(() => mountComposite(q), {
      scriptProfile: true,
      profileLimit: 20,
      verify: () => verifyCompositeMounted(q),
    });
  });

  test("move across items", async ({ q, page, perf }) => {
    const firstItem = q.button("Item 1");

    await perf.measure(() => moveAcrossItems(page), {
      setup: async () => {
        await setupComposite(q);
        await firstItem.focus();
        await expect(firstItem).toBeFocused();
      },
      verify: () => verifyMovedAcrossItems(q),
    });
  });

  test("move across items (script profile)", async ({ q, page, perf }) => {
    const firstItem = q.button("Item 1");

    await perf.measure(() => moveAcrossItems(page), {
      scriptProfile: true,
      profileLimit: 20,
      setup: async () => {
        await setupComposite(q);
        await firstItem.focus();
        await expect(firstItem).toBeFocused();
      },
      verify: () => verifyMovedAcrossItems(q),
    });
  });

  test("mount controlled composite", async ({ q, perf }) => {
    const mountButton = q.button("Mount controlled composite");
    await perf.measure(() => mountButton.click(), {
      verify: () => verifyCompositeMounted(q),
    });
  });

  test("update controlled items", async ({ q, perf }) => {
    await perf.measure(() => updateControlledItems(q), {
      setup: () => setupControlledComposite(q),
      verify: () => verifyControlledItemsUpdated(q),
    });
  });
});

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
  const firstItem = q.button("Item 1");
  await expect(firstItem).toBeVisible();
  await firstItem.focus();
  await expect(firstItem).toBeFocused();
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
  test("mount composite", async ({ perf }) => {
    await perf.measure(({ q }) => mountComposite(q), {
      verify: ({ q }) => verifyCompositeMounted(q),
    });
  });

  test("mount composite (script profile)", async ({ perf }) => {
    await perf.measure(({ q }) => mountComposite(q), {
      scriptProfile: true,
      profileLimit: 20,
      verify: ({ q }) => verifyCompositeMounted(q),
    });
  });

  test("move across items", async ({ perf }) => {
    await perf.measure(({ page }) => moveAcrossItems(page), {
      setup: ({ q }) => setupComposite(q),
      verify: ({ q }) => verifyMovedAcrossItems(q),
    });
  });

  test("move across items (script profile)", async ({ perf }) => {
    await perf.measure(({ page }) => moveAcrossItems(page), {
      scriptProfile: true,
      profileLimit: 20,
      setup: ({ q }) => setupComposite(q),
      verify: ({ q }) => verifyMovedAcrossItems(q),
    });
  });

  test("mount controlled composite", async ({ perf }) => {
    await perf.measure(
      ({ q }) => q.button("Mount controlled composite").click(),
      {
        verify: ({ q }) => verifyCompositeMounted(q),
      },
    );
  });

  test("update controlled items", async ({ perf }) => {
    await perf.measure(({ q }) => updateControlledItems(q), {
      setup: ({ q }) => setupControlledComposite(q),
      verify: ({ q }) => verifyControlledItemsUpdated(q),
    });
  });
});

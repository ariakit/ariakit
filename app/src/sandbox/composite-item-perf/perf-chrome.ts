import type { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { getItemName, itemParam } from "#app/test-utils/item-perf.ts";
import { gotoAndSettle, withFramework } from "#app/test-utils/preview.ts";

const itemCount = 1000;
const moveCount = 100;

type Query = ReturnType<typeof query>;

async function mountComposite(q: Query) {
  await q.button("Mount composite").click();
  await q.button(getItemName(itemCount)).waitFor({ state: "attached" });
}

async function verifyCompositeMounted(q: Query) {
  await expect(q.button(/^Item /)).toHaveCount(itemCount);
  await expect(q.status("Item variant")).toHaveText(itemParam);
}

async function unmountComposite(q: Query) {
  await q.button("Unmount composite").click();
  await q.button("Item 1", { exact: true }).waitFor({ state: "detached" });
}

async function verifyCompositeUnmounted(q: Query) {
  await expect(q.button(/^Item /)).toHaveCount(0);
}

async function setupCompositeMovement(q: Query) {
  await mountComposite(q);
  const firstItem = q.button("Item 1", { exact: true });
  await firstItem.focus();
  await expect(firstItem).toBeFocused();
}

async function moveAcrossItems(page: Page) {
  for (let index = 0; index < moveCount; index += 1) {
    const itemNumber = index + 2;
    await page.keyboard.press("ArrowDown");
    await page.waitForFunction((expectedItemNumber) => {
      return (
        document.activeElement?.getAttribute("data-item") ===
        `Item ${expectedItemNumber}`
      );
    }, itemNumber);
  }
}

async function verifyMovedAcrossItems(q: Query) {
  await expect(q.button(getItemName(moveCount + 1))).toBeFocused();
}

withFramework(import.meta.dirname, async ({ test }) => {
  test.beforeEach(async ({ page, q }) => {
    const url = new URL(page.url());
    url.searchParams.set("item", itemParam);
    await gotoAndSettle(page, url.href);
    await expect(q.status("Item variant")).toHaveText(itemParam);
  });

  test("mount composite", async ({ perf }) => {
    await perf.measure(({ q }) => mountComposite(q), {
      verify: ({ q }) => verifyCompositeMounted(q),
    });
  });

  test("unmount composite", async ({ perf }) => {
    await perf.measure(({ q }) => unmountComposite(q), {
      setup: ({ q }) => mountComposite(q),
      verify: ({ q }) => verifyCompositeUnmounted(q),
    });
  });

  test("move across items", async ({ perf }) => {
    await perf.measure(({ page }) => moveAcrossItems(page), {
      setup: ({ q }) => setupCompositeMovement(q),
      verify: ({ q }) => verifyMovedAcrossItems(q),
    });
  });
});

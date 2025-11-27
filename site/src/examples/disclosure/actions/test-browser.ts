import { query } from "@ariakit/test/playwright";
import type { Locator } from "@playwright/test";
import { expect, test } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";
import { visual } from "#app/test-utils/visual.ts";

async function getContent(button: Locator) {
  const contentId = await button.getAttribute("aria-controls");
  return button.page().locator(`[id="${contentId}"]`);
}

withFramework(import.meta.dirname, async () => {
  test.beforeEach(async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
  });

  test("hover @visual", async ({ page }) => {
    const q = query(page);
    await q.button("Lina Park").hover();
    await visual(page);
  });

  test("open @visual", async ({ page }) => {
    const q = query(page);
    await q.button("Brightside Studio").click();
    const content = await getContent(q.button("Brightside Studio"));
    await expect(content).toBeVisible();
    await visual(page);
  });

  test("click select @visual", async ({ page }) => {
    const q = query(page);
    const qq = query(q.button("Lina Park"));
    await qq.combobox("Order Status").click();
    await visual(page);
  });
});

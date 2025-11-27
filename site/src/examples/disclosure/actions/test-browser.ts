import { query } from "@ariakit/test/playwright";
import { test } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";
import { visual } from "#app/test-utils/visual.ts";

withFramework(import.meta.dirname, async () => {
  test("hover @visual", async ({ page }) => {
    const q = query(page);
    await q.button("Lina Park").hover();
    await visual(page);
  });

  test("open @visual", async ({ page }) => {
    const q = query(page);
    await q.button("Brightside Studio").click();
    await q.cell("Ceramic Mug (Matte Black)").hover();
    await visual(page);
  });

  test("click select @visual", async ({ page }) => {
    const q = query(page);
    const qq = query(q.button("Lina Park"));
    await qq.combobox("Order Status").click();
    await visual(page);
  });
});

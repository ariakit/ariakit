import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

async function getContent(button: Locator) {
  const contentId = await button.getAttribute("aria-controls");
  return button.page().locator(`[id="${contentId}"]`);
}

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("hover @visual", async ({ q, visual }) => {
    await q.button("Lina Park").hover();
    await visual();
  });

  test("open @visual", async ({ q, visual }) => {
    await q.button("Brightside Studio").click();
    const content = await getContent(q.button("Brightside Studio"));
    await test.expect(content).toBeVisible();
    await visual();
  });

  test("click select @visual", async ({ q, visual }) => {
    const qq = query(q.button("Lina Park"));
    await qq.combobox("Order Status").click();
    await visual();
  });
});

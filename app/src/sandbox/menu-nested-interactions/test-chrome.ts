import { expect, query } from "@ariakit/test/playwright";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("https://github.com/ariakit/ariakit/issues/4247", async ({ page }) => {
    const q = query(page);
    await q.button("Edit").click();
    await expect(q.menu("Edit")).toBeVisible();
    await q.menuitem("Find").hover();
    await expect(q.menu("Find")).toBeVisible();
    const box = await q.menuitem("Speech").boundingBox();
    if (!box) return;
    const { x, y } = box;
    await page.mouse.move(x + 10, y + 10, { steps: 2 });
    await expect(q.menu("Speech")).toBeVisible();
    await expect(q.menu("Find")).not.toBeVisible();
  });
});

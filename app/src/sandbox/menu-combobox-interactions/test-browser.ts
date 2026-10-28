import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("https://github.com/ariakit/ariakit/issues/4324", async ({
    page,
    q,
  }) => {
    const button = q.button("Provider Add block");
    const dialog = q.dialog("Provider Add block");
    await button.click();
    await expect(dialog).toBeVisible();
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await page.mouse.click(10, 10);
    await expect(dialog).not.toBeVisible();
    await expect(button).not.toBeInViewport();
  });
});

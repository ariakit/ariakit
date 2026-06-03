import type { Locator, Page } from "@playwright/test";
import { gotoAndSettle, withFramework } from "#app/test-utils/preview.ts";

const previewReadyAttempts = 4;
const previewReadyTimeout = 10_000;

withFramework(import.meta.dirname, async ({ test }) => {
  const expectPreviewContent = async (page: Page, locator: Locator) => {
    let lastError: unknown;
    for (let attempt = 0; attempt < previewReadyAttempts; attempt += 1) {
      if (attempt > 0) {
        await gotoAndSettle(page, page.url());
      }
      try {
        await test
          .expect(locator)
          .toBeVisible({ timeout: previewReadyTimeout });
        return;
      } catch (error) {
        lastError = error;
      }
    }
    throw lastError;
  };

  test("uses cross-axis size for mixed-orientation nested items", async ({
    page,
    q,
  }) => {
    test.setTimeout(90_000);
    await expectPreviewContent(page, q.text(/Horizontal group/));
    await test.expect(q.text("After group")).toBeVisible();

    const groupBox = await page.locator("#horizontal-group").boundingBox();
    const afterBox = await page.locator("#after-group").boundingBox();

    test.expect(groupBox).not.toBeNull();
    test.expect(afterBox).not.toBeNull();
    if (!groupBox) return;
    if (!afterBox) return;

    test.expect(Math.round(afterBox.y - groupBox.y)).toBe(32);
  });
});

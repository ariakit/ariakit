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

  test("cleans up observed item elements", async ({ page, q }) => {
    test.setTimeout(90_000);
    await expectPreviewContent(page, q.text("First item version 0"));
    await test.expect(q.text("Second item version 0")).toBeVisible();
    await test.expect(q.text("Observed items: 2")).toBeVisible();

    await q.button("Replace first item").click();
    await test.expect(q.text("First item version 1")).toBeVisible();
    await test.expect(q.text("Observed items: 2")).toBeVisible();

    await q.button("Hide renderer").click();
    await test.expect(q.text("First item version 1")).not.toBeVisible();
    await test.expect(q.text("Second item version 0")).not.toBeVisible();
    await test.expect(q.text("Observed items: 0")).toBeVisible();
  });
});

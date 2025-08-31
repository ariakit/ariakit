import { test } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";
import { screenshot } from "#app/test-utils/screenshot.ts";

withFramework(import.meta.dirname, async () => {
  test("separator", async ({ page }) => {
    await screenshot(page);
  });
});

import { test } from "@playwright/test";
import {
  matchScreenshots,
  navigateToPreviewForCurrentTest,
} from "#app/test-utils.ts";

test("disclosure component preview", async ({ page }, testInfo) => {
  await navigateToPreviewForCurrentTest(page, testInfo);
  await matchScreenshots(page, testInfo, { clipMargin: 12 });
});

import { test } from "@playwright/test";
import {
  navigateToPreviewForCurrentTest,
  visualTest,
} from "#app/test-utils.ts";

test("disclosure component preview", async ({ page }, testInfo) => {
  await navigateToPreviewForCurrentTest(page, testInfo);
  await visualTest(page, testInfo, { clipMargin: 12 });
});

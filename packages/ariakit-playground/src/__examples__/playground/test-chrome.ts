import { expect, test } from "@playwright/test";

test("editor screenshot", async ({ page }, testInfo) => {
  testInfo.snapshotSuffix = "";
  await page.goto("/examples/playground");
  const editor = await page.locator("role=group[name=index.js]");
  expect(await editor.screenshot()).toMatchSnapshot();
});

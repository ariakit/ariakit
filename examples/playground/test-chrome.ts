import { expect, test } from "@playwright/test";

test("editor screenshot", async ({ page, headless }, testInfo) => {
  testInfo.snapshotSuffix = "";
  await page.goto("/examples/playground");
  const editor = await page.getByRole("group", { name: "index.js" });
  if (!headless) return;
  expect(await editor.screenshot()).toMatchSnapshot();
});

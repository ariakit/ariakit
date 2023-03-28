import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/playground");
});

test("editor screenshot", async ({ page }) => {
  test.info().snapshotSuffix = "";
  const editor = page.getByRole("group", { name: "index.js" });
  expect(await editor.screenshot()).toMatchSnapshot();
});

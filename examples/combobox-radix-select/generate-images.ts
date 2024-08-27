import { query } from "@ariakit/test/playwright";
import { test } from "@playwright/test";
import { screenshot } from "../screenshot.ts";

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/combobox-radix-select", {
    waitUntil: "networkidle",
  });
});

test("generate images", async ({ page }) => {
  const q = query(page);
  await q.combobox().click();
  await q.combobox().fill("en");

  const select = q.combobox("Language", { includeHidden: true }).first();

  await screenshot({
    page,
    name: "small",
    elements: [select, q.dialog()],
    padding: 24,
    width: 148,
    height: "auto",
    transparent: false,
  });

  await screenshot({
    page,
    name: "medium",
    elements: [select, q.dialog()],
    padding: 24,
    paddingTop: 44,
    height: "auto",
    transparent: false,
  });

  await screenshot({
    page,
    name: "large",
    elements: [select, q.dialog()],
  });
});

import { query } from "@ariakit/test/playwright";
import { test } from "@playwright/test";
import { screenshot } from "../test-utils.ts";

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/combobox-links", {
    waitUntil: "networkidle",
  });
});

test("generate images", async ({ page }) => {
  const q = query(page);
  await q.combobox().click();
  await page.mouse.move(0, 0);
  await page.keyboard.press("ArrowDown");

  await page.locator("label").evaluate((el) => el.remove());

  await screenshot({
    page,
    name: "small",
    elements: [q.combobox()],
    padding: 24,
    paddingLeft: -144,
    width: 128,
    height: "auto",
  });

  await screenshot({
    page,
    name: "medium",
    elements: [q.combobox()],
    padding: 24,
    paddingTop: 44,
    height: "auto",
  });

  await screenshot({
    page,
    name: "large",
    elements: [q.combobox(), q.listbox()],
  });
});

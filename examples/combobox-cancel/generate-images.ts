import { query } from "@ariakit/test/playwright";
import { test } from "@playwright/test";
import { screenshot } from "../test-utils.ts";

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/combobox-cancel", { waitUntil: "networkidle" });
});

test("generate images", async ({ page }) => {
  const q = query(page);
  await q.combobox().click();
  await page.keyboard.press("Tab");

  await page.locator("label").evaluate((el) => el.remove());

  await screenshot({
    page,
    name: "small",
    elements: [q.button("Clear input")],
    padding: 24,
    paddingLeft: 64,
    width: 120,
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

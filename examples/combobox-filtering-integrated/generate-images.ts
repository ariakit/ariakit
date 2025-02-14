import { query } from "@ariakit/test/playwright";
import { test } from "@playwright/test";
import { preview, screenshot } from "../test-utils.ts";

test.beforeEach(async ({ page }) => {
  await page.goto(preview("combobox-filtering-integrated"), {
    waitUntil: "networkidle",
  });
});

test("generate images", async ({ page }) => {
  const q = query(page);
  await q.combobox().click();
  await q.combobox().fill("a");

  await screenshot({
    page,
    name: "small",
    elements: [q.combobox()],
    padding: 24,
    width: 160,
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

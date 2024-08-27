import { query } from "@ariakit/test/playwright";
import { test } from "@playwright/test";
import { screenshot } from "../screenshot.ts";

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/combobox-multiple", { waitUntil: "networkidle" });
});

test("generate images", async ({ page }) => {
  await page.setViewportSize({ width: 500, height: 600 });

  const q = query(page);
  await q.combobox().click();
  await q.option("Salad").click();
  await q.option("Sandwich").click();
  await q.combobox().fill("sa");
  await page.mouse.move(0, 0);
  await page.keyboard.press("ArrowDown");

  await page.locator("label").evaluate((el) => el.remove());

  await screenshot({
    page,
    name: "small",
    elements: [q.combobox()],
    paddingLeft: 24,
    paddingTop: 24,
    width: 160,
    height: 160,
  });

  await screenshot({
    page,
    name: "medium",
    elements: [q.combobox()],
    padding: 24,
    paddingTop: 40,
    height: "auto",
  });

  await screenshot({
    page,
    name: "large",
    elements: [q.combobox(), q.listbox()],
  });
});

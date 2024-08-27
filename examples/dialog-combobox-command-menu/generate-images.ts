import { query } from "@ariakit/test/playwright";
import { expect, test } from "@playwright/test";
import { screenshot } from "../screenshot.ts";

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/dialog-combobox-command-menu", {
    waitUntil: "networkidle",
  });
});

test("generate images", async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 800 });

  const q = query(page);
  await q.button("Open Command Menu").click();
  await expect(q.dialog("Command Menu")).toBeVisible();

  await screenshot({
    page,
    name: "small",
    elements: [q.dialog()],
    padding: 24,
    width: 180,
    height: 180,
  });

  await screenshot({
    page,
    name: "large",
    elements: [q.dialog()],
  });

  await page.setViewportSize({ width: 440, height: 800 });
  await q.dialog().evaluate((el) => {
    el.style.inset = "48px";
    el.style.margin = "0";
  });

  await screenshot({
    page,
    name: "medium",
    elements: [q.dialog()],
    padding: 16,
    paddingTop: 32,
    height: "auto",
  });
});

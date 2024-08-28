import { query } from "@ariakit/test/playwright";
import { test } from "@playwright/test";
import { screenshot } from "../test-utils.ts";

test.beforeEach(async ({ page }) => {
  await page.goto("/previews/combobox-textarea", {
    waitUntil: "networkidle",
  });
});

test("generate images", async ({ page }) => {
  const q = query(page);

  await q.combobox().click();
  await page.mouse.move(0, 0);
  await q.combobox().pressSequentially("Hello :th");

  await page.locator("label").evaluate((el) => el.firstChild?.remove());

  await screenshot({
    page,
    name: "small",
    elements: [q.combobox()],
    padding: 24,
    width: 184,
    height: "auto",
  });

  await screenshot({
    page,
    name: "medium",
    elements: [q.combobox()],
    padding: 24,
    width: 230,
    height: "auto",
  });

  await screenshot({
    page,
    name: "large",
    elements: [q.combobox(), q.listbox()],
  });
});

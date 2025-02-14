import { query } from "@ariakit/test/playwright";
import { test } from "@playwright/test";
import { preview, screenshot } from "../test-utils.ts";

test.beforeEach(async ({ page }) => {
  await page.goto(preview("checkbox-group"), { waitUntil: "networkidle" });
});

test("generate images", async ({ page }) => {
  const q = query(page);
  await q.checkbox("Apple").click();
  await page.mouse.move(0, 0);

  await screenshot({
    page,
    name: "small",
    elements: [q.group()],
    padding: 24,
    width: 136,
    height: "auto",
  });

  await screenshot({
    page,
    name: "medium",
    elements: [q.group()],
    padding: 40,
  });

  await screenshot({
    page,
    name: "large",
    elements: [q.group()],
  });
});

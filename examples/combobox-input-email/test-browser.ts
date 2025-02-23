import { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import { test } from "../test-utils.ts";

test("combobox should not throw when input type=email", async ({ page }) => {
  const q = query(page);
  await q.combobox("Email").click();

  page.on("pageerror", (error) => {
    if (!error.message.includes("setSelectionRange")) return;
    throw error;
  });

  await q.combobox("Email").fill("e");
  await page.keyboard.press("ArrowDown");
  await expect(q.option("email1@ariakit.org")).toHaveAttribute(
    "data-active-item",
  );
});

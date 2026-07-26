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
  await expect(q.option("email1@ariakit.com")).toHaveAttribute(
    "data-active-item",
  );
});

// https://github.com/ariakit/ariakit/issues/3086
test("moves focus back to the email input when typing on an item", async ({
  page,
}) => {
  const q = query(page);
  const combobox = q.combobox("Email");
  await combobox.click();
  await combobox.fill("e");
  await page.keyboard.press("ArrowDown");
  await expect(q.option("email1@ariakit.com")).toBeFocused();

  await page.keyboard.press("2");
  await expect(combobox).toBeFocused();
  await expect(combobox).toHaveValue("e2");
});

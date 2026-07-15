import { test } from "#app/test-utils/fixtures.ts";
import { gotoAndSettle } from "#app/test-utils/preview.ts";

test("theme button works after client-side navigation", async ({ page }) => {
  await gotoAndSettle(page, "/");

  const themeSidebar = page.locator("#theme-sidebar");
  const pageLoad = page.evaluate(() => {
    return new Promise<void>((resolve) => {
      document.addEventListener("astro:page-load", () => resolve(), {
        once: true,
      });
    });
  });

  await test.expect(themeSidebar).toHaveAttribute("data-state", "closed");
  await Promise.all([
    page.waitForURL("**/plus/"),
    pageLoad,
    page.getByRole("link", { name: "Plus" }).click(),
  ]);
  await page.getByRole("button", { name: /Theme/ }).click();

  await test.expect(themeSidebar).toHaveAttribute("data-state", "open");
});

test("theme shortcut ignores editable targets", async ({ page }) => {
  await gotoAndSettle(page, "/react/examples/checkbox-card/");

  const themeSidebar = page.locator("#theme-sidebar");
  const nameField = page.getByRole("textbox", { name: "Name" });

  await test.expect(themeSidebar).toHaveAttribute("data-state", "closed");
  await nameField.click();
  await page.keyboard.press("t");

  await test.expect(nameField).toHaveValue("t");
  await test.expect(themeSidebar).toHaveAttribute("data-state", "closed");
  await nameField.evaluate((element) => element.blur());
  await page.keyboard.press("t");
  await test.expect(themeSidebar).toHaveAttribute("data-state", "open");
});

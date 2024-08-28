import { query } from "@ariakit/test/playwright";
import { screenshot, test } from "../test-utils.ts";

test.use({ headless: false });

test("generate images", async ({ page }) => {
  await page.setViewportSize({ width: 400, height: 400 });

  const q = query(page);
  await q.button().click();
  const backdrop = q.dialog().locator("..");

  await backdrop.evaluate((el) => (el.style.background = "transparent"));

  for (const colorScheme of ["light", "dark"] as const) {
    await page.setViewportSize({ width: 400, height: 400 });
    await page.emulateMedia({ colorScheme });

    await backdrop.evaluate((el) => (el.style.padding = "1.5rem 2.25rem"));
    await page.mouse.wheel(0, 3000);
    await page.mouse.move(395, 200);
    await page.waitForTimeout(250);

    await screenshot({
      page,
      name: "small",
      colorScheme,
      padding: 0,
      clip: {
        x: 240,
        y: 240,
        width: 160,
        height: 160,
      },
    });

    await backdrop.evaluate((el) => (el.style.padding = "2rem 2.75rem"));
    await page.mouse.wheel(0, 3000);
    await page.mouse.move(395, 200);
    await page.waitForTimeout(250);

    await screenshot({
      page,
      name: "medium",
      colorScheme,
      padding: 0,
      elements: [backdrop],
      height: "auto",
    });

    await page.setViewportSize({ width: 600, height: 600 });
    await backdrop.evaluate((el) => (el.style.padding = "3rem 3.75rem"));
    await page.mouse.wheel(0, 3000);
    await page.mouse.move(395, 200);
    await page.waitForTimeout(250);

    await screenshot({
      page,
      name: "large",
      colorScheme,
      padding: 0,
      elements: [backdrop],
      height: "auto",
    });
  }
});

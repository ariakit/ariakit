import { query } from "@ariakit/test/playwright";
import { screenshot, test } from "../test-utils.ts";

test("generate images", async ({ page }) => {
  await page.setViewportSize({ width: 200, height: 400 });
  await page.mouse.wheel(0, 92);
  await page.waitForTimeout(250);

  const q = query(page);
  const button = q.button("Show modal", { includeHidden: true });

  await page.keyboard.press("Tab");
  await button.click();

  await screenshot({
    page,
    name: "small",
    elements: [button, q.dialog()],
    padding: 8,
    width: 168,
    height: "auto",
  });

  await page.keyboard.press("Escape");

  await page.setViewportSize({ width: 264, height: 400 });
  await page.mouse.wheel(0, -12);
  await page.waitForTimeout(250);

  await button.click();

  await screenshot({
    page,
    name: "medium",
    elements: [button, q.dialog()],
    padding: 14,
    height: "auto",
  });

  await page.setViewportSize({ width: 400, height: 400 });

  await screenshot({
    page,
    name: "large",
    elements: [button, q.dialog()],
  });
});

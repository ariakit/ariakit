import { expect, query } from "@ariakit/test/playwright";
import { screenshot, test } from "../test-utils.ts";

test("generate images", async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 800 });

  const q = query(page);
  await q.button("With Tabs", { exact: true }).click();
  await expect(q.dialog("Command Menu")).toBeVisible();

  await page.keyboard.type("sel");

  await screenshot({
    page,
    name: "small",
    elements: [q.dialog()],
    padding: 24,
    width: 178,
    height: 178,
  });

  await screenshot({
    page,
    name: "large",
    elements: [q.dialog()],
  });

  await page.setViewportSize({ width: 480, height: 800 });

  await q.dialog().evaluate((el) => {
    el.style.inset = "48px";
    el.style.margin = "0";
  });

  // Make sure the caret appears
  await page.keyboard.press("Backspace");
  await page.keyboard.type("l");

  await screenshot({
    page,
    name: "medium",
    elements: [q.dialog()],
    padding: 16,
    paddingTop: 32,
    height: "auto",
  });
});

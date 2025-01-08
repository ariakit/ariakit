import { expect, query } from "@ariakit/test/playwright";
import { screenshot, test } from "../test-utils.ts";

test("generate images", async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 800 });

  const q = query(page);

  const buttons = await q
    .button(undefined, { includeHidden: true })
    .filter({ hasNotText: /^With Tabs$/ })
    .all();

  for (const button of buttons) {
    await button.evaluate((el) => (el.style.display = "none"));
  }

  await q.button("With Tabs", { exact: true }).click();
  await expect(q.dialog("Command Menu")).toBeVisible();

  await page.keyboard.type("sel");

  await screenshot({
    page,
    name: "small",
    elements: [q.dialog()],
    padding: 16,
    width: 204,
    height: 204,
    caret: "force",
  });

  await screenshot({
    page,
    name: "large",
    elements: [q.dialog()],
    caret: "force",
  });

  await page.setViewportSize({ width: 480, height: 800 });

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
    caret: "force",
  });
});

import { query } from "@ariakit/test/playwright";
import { screenshot, test } from "../test-utils.ts";

test("generate images", async ({ page }) => {
  await page.setViewportSize({ width: 1200, height: 1024 });

  const q = query(page);
  const button = q.button("Show modal", { includeHidden: true });

  await page.keyboard.press("Tab");
  await button.click();

  await screenshot({
    page,
    name: "small",
    elements: [button],
    paddingTop: 152,
    paddingLeft: 138,
    width: 200,
    height: "auto",
  });

  await screenshot({
    page,
    name: "medium",
    elements: [q.dialog()],
    padding: -8,
    height: "auto",
  });

  await screenshot({
    page,
    name: "large",
    elements: [button, q.dialog()],
  });
});

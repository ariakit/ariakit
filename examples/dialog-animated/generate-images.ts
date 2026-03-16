import { query } from "@ariakit/test/playwright";
import { screenshot, test } from "../test-utils.ts";

test("generate images", async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 1080 });

  const q = query(page);
  const button = q.button("Show modal", { includeHidden: true });
  await button.click();

  await screenshot({
    page,
    name: "small",
    elements: [q.dialog()],
    padding: 24,
    width: 150,
    height: "auto",
  });

  await screenshot({
    page,
    name: "medium",
    elements: [q.dialog(), button],
    padding: 24,
  });

  await screenshot({
    page,
    name: "large",
    elements: [q.dialog(), button],
  });
});

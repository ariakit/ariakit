import { query } from "@ariakit/test/playwright";
import { screenshot, test } from "../test-utils.ts";

test("generate images", async ({ page }) => {
  const q = query(page);
  const link = q.link("Post", { includeHidden: true });
  await link.click();

  await screenshot({
    page,
    name: "small",
    elements: [q.dialog()],
    padding: 24,
    width: 160,
    height: "auto",
  });

  await page.setViewportSize({ width: 332, height: 970 });

  await screenshot({
    page,
    name: "medium",
    elements: [link, q.dialog()],
    padding: 40,
    height: "auto",
  });

  await page.setViewportSize({ width: 800, height: 1340 });

  await screenshot({
    page,
    name: "large",
    elements: [link, q.dialog()],
  });
});

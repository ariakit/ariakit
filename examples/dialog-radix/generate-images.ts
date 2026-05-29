import { query } from "@ariakit/test/playwright";
import { screenshot, test } from "../test-utils.ts";

test("generate images", async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 1100 });

  const q = query(page);
  const button = q.button("Edit profile", { includeHidden: true });
  await button.click();

  await screenshot({
    page,
    name: "small",
    elements: [q.dialog()],
    padding: 24,
    width: 148,
    height: "auto",
    transparent: false,
  });

  await screenshot({
    page,
    name: "medium",
    elements: [button, q.dialog()],
    padding: 24,
    paddingTop: 44,
    height: "auto",
    transparent: false,
  });

  await screenshot({
    page,
    name: "large",
    elements: [button, q.dialog()],
  });
});

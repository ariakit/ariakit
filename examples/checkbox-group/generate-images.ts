import { query } from "@ariakit/test/playwright";
import { screenshot, test } from "../test-utils.ts";

test("generate images", async ({ page }) => {
  const q = query(page);
  await q.checkbox("Apple").click();
  await page.mouse.move(0, 0);

  await screenshot({
    page,
    name: "small",
    elements: [q.group()],
    padding: 24,
    width: 136,
    height: "auto",
  });

  await screenshot({
    page,
    name: "medium",
    elements: [q.group()],
    padding: 40,
  });

  await screenshot({
    page,
    name: "large",
    elements: [q.group()],
  });
});

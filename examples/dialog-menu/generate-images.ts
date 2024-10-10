import { query } from "@ariakit/test/playwright";
import { screenshot, test } from "../test-utils.ts";

test("generate images", async ({ page }) => {
  const q = query(page);
  await q.button().click();
  await q.button("Share").click();
  await page.mouse.move(0, 0);
  await page.keyboard.press("ArrowDown");

  await screenshot({
    page,
    name: "small",
    elements: [q.menu()],
    paddingTop: 56,
    paddingLeft: 40,
    width: 150,
    height: "auto",
  });

  await screenshot({
    page,
    name: "medium",
    elements: [q.menu()],
    paddingTop: 56,
    padding: 40,
    height: "auto",
  });

  await screenshot({
    page,
    name: "large",
    elements: [q.dialog(), q.menu()],
  });
});

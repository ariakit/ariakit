import { query } from "@ariakit/test/playwright";
import { screenshot, test } from "../test-utils.ts";

test("generate images", async ({ page }) => {
  await page.setViewportSize({ width: 800, height: 600 });

  const q = query(page);
  await q.combobox().click();
  await q.tab("All 53").click();
  await q.combobox().fill("se");
  await page.mouse.move(0, 0);

  await screenshot({
    page,
    name: "small",
    elements: [q.combobox()],
    padding: 24,
    width: 162,
    height: 162,
  });

  await screenshot({
    page,
    name: "medium",
    elements: [q.combobox()],
    padding: 40,
    height: "auto",
  });

  await screenshot({
    page,
    name: "large",
    elements: [q.combobox(), q.dialog()],
  });
});

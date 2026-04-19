import { query } from "@ariakit/test/playwright";
import { screenshot, test } from "../test-utils.ts";

test("generate images", async ({ page }) => {
  const q = query(page);
  await q.combobox().click();

  await page.locator("label").evaluate((el) => el.remove());

  await screenshot({
    page,
    name: "small",
    elements: [q.combobox()],
    padding: 24,
    width: 140,
    height: "auto",
    transparent: false,
  });

  await screenshot({
    page,
    name: "medium",
    elements: [q.combobox()],
    padding: 24,
    paddingTop: 44,
    height: "auto",
    transparent: false,
  });

  await screenshot({
    page,
    name: "large",
    elements: [q.combobox(), q.listbox()],
  });
});

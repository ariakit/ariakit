import { flushFrames, withFramework } from "#app/test-utils/preview.ts";
import list from "./list.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("filters the list and reports no results", async ({ page, q }) => {
    const combobox = q.combobox();
    await combobox.click();
    await test.expect(q.option()).toHaveCount(list.length);

    await combobox.fill("sa");
    await test.expect(q.option()).toHaveCount(5);
    await flushFrames(page);
    await page.keyboard.press("ArrowDown");
    await test.expect(q.option("Salad")).toHaveAttribute("data-active-item");
    await page.keyboard.press("ArrowDown");
    await test.expect(q.option("Sandwich")).toHaveAttribute("data-active-item");

    await combobox.fill("zzz");
    await test.expect(q.option()).toHaveCount(0);
    await test.expect(q.text("No results found")).toBeVisible();
  });
});

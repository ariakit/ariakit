import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("opens, navigates, and closes the integrated popup", async ({
    page,
    q,
  }) => {
    const combobox = q.combobox();
    await combobox.focus();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.listbox()).toBeVisible();
    await page.keyboard.press("PageDown");
    await test.expect(q.option("Yogurt")).toHaveAttribute("data-active-item");
    await page.keyboard.press("Escape");
    await test.expect(q.listbox()).toHaveCount(0);
    await test.expect(combobox).toBeFocused();
  });

  test("focuses hovered matches and filters registered items", async ({
    page,
    q,
  }) => {
    const combobox = q.combobox();
    await combobox.click();
    await q.option("Banana").hover();
    await test.expect(q.option("Banana")).toHaveAttribute("data-active-item");
    await q.option("Burger").hover();
    await test.expect(q.option("Burger")).toHaveAttribute("data-active-item");

    await combobox.fill("gr");
    await test.expect(q.option()).toHaveCount(3);
    await test.expect(q.option("Burger")).toHaveAttribute("data-active-item");
    await test.expect(q.option("Grapes")).toBeVisible();
    await test.expect(q.option("Yogurt")).toBeVisible();

    await page.keyboard.type("q");
    await test.expect(q.option()).toHaveCount(0);
    await test.expect(q.text("No results found")).toBeVisible();
  });
});

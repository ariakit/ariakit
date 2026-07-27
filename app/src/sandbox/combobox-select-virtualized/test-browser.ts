import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("filters and selects a grouped virtualized option", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Country");
    await select.click();

    const renderedCount = await q.option().count();
    test.expect(renderedCount).toBeGreaterThan(0);
    test.expect(renderedCount).toBeLessThan(64);

    const search = q.combobox("Search countries");
    await search.fill("zambia");
    await test.expect(q.option("Zambia")).toBeVisible();
    await q.option("Zambia").click();

    await test.expect(select).toHaveText("Zambia");
    await test.expect(q.listbox()).toHaveCount(0);

    await select.click();
    await test.expect(search).toHaveValue("");
    await test.expect(q.option("Argentina")).toBeVisible();

    await page.keyboard.press("Escape");
    await test.expect(q.listbox()).toHaveCount(0);
  });
});

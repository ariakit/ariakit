import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("keeps the active result highlighted after the pointer leaves", async ({
    q,
  }) => {
    const input = q.combobox("Find records");
    await input.fill("m");
    const target = q.option("Sarah Davis");
    const restingBackground = await q
      .option("John Smith")
      .evaluate((element) => getComputedStyle(element).backgroundColor);
    await target.scrollIntoViewIfNeeded();
    await target.hover();
    await input.hover();
    await test
      .expect(input)
      .toHaveAttribute(
        "aria-activedescendant",
        await target.evaluate((element) => element.id),
      );
    await test
      .expect(target)
      .not.toHaveCSS("background-color", restingBackground);
    await input.press("Enter");
    await test.expect(input).toHaveValue("Sarah Davis");
    await test.expect(q.listbox()).not.toBeVisible();
  });
});

import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("keeps the active result highlighted after the pointer leaves", async ({
    q,
  }) => {
    const input = q.combobox("Find records");
    await input.fill("m");
    const other = q.option("John Smith");
    await other.scrollIntoViewIfNeeded();
    await other.hover();
    await input.hover();
    const target = q.option("Sarah Davis");
    await target.scrollIntoViewIfNeeded();
    await test.expect(target).not.toHaveAttribute("data-active-item");
    const restingBackground = await target.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    );
    await target.hover();
    await input.hover();
    await test.expect(target).toHaveAttribute("data-active-item");
    await test
      .expect(target)
      .not.toHaveCSS("background-color", restingBackground);
    await input.press("Enter");
    await test.expect(input).toHaveValue("Sarah Davis");
    await test.expect(q.listbox()).not.toBeVisible();
  });
});

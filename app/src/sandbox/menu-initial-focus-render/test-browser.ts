import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("does not re-render when rendered items keep the same focus element", async ({
    page,
    q,
  }) => {
    await q.button("Actions").focus();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.menu()).toBeVisible();
    await test.expect(q.menuitem("Edit")).toBeVisible();

    await flushFrames(page);

    const menuRenders = q.status("Menu renders");
    const renderedItemsRenders = q.status("Rendered items renders");
    const previousMenuRenders = await menuRenders.textContent();
    const previousRenderedItemsRenders =
      await renderedItemsRenders.textContent();

    if (previousMenuRenders == null) {
      throw new Error("Menu render count was not found");
    }
    if (previousRenderedItemsRenders == null) {
      throw new Error("Rendered items render count was not found");
    }

    await q.button("Refresh rendered items").click();

    await test
      .expect(renderedItemsRenders)
      .not.toHaveText(previousRenderedItemsRenders);
    await test.expect(menuRenders).toHaveText(previousMenuRenders);
  });
});

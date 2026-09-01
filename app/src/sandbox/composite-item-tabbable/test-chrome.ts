import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7364
  test("moves to an accessible disabled item inherited through composition", async ({
    page,
    q,
  }) => {
    await q.option("Inherited one").click();
    await test.expect(q.option("Inherited one")).toBeFocused();

    const accessibleDisabledItem = q.option("Inherited two");
    await test
      .expect(accessibleDisabledItem)
      .toHaveAttribute("aria-disabled", "true");
    await test.expect(accessibleDisabledItem).not.toHaveAttribute("disabled");

    await page.keyboard.press("ArrowRight");
    await test.expect(accessibleDisabledItem).toBeFocused();
  });
});

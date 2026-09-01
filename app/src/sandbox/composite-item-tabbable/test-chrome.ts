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

  // https://github.com/ariakit/ariakit/pull/7376#discussion_r3900272358
  test("honors an inner accessible disabled override", async ({ page, q }) => {
    const firstItem = q.option("Override one");
    const overrideItem = q.option("Override two");
    const lastItem = q.option("Override three");

    await firstItem.click();
    await page.keyboard.press("ArrowRight");
    await test.expect(lastItem).toBeFocused();

    await q.button("Make override accessible").click();
    await firstItem.click();
    await page.keyboard.press("ArrowRight");
    await test.expect(overrideItem).toBeFocused();

    await q.button("Replace with accessible link").click();
    await test.expect(overrideItem).toHaveAttribute("href", "#override-two");
    await firstItem.click();
    await page.keyboard.press("ArrowRight");
    await test.expect(overrideItem).toBeFocused();

    await q.button("Make override inaccessible").click();
    await firstItem.click();
    await page.keyboard.press("ArrowRight");
    await test.expect(lastItem).toBeFocused();

    await q.button("Make override accessible").click();
    await firstItem.click();
    await page.keyboard.press("ArrowRight");
    await test.expect(overrideItem).toBeFocused();

    await q.button("Replace with inaccessible div").click();
    await test.expect(overrideItem).not.toHaveAttribute("href");
    await firstItem.click();
    await page.keyboard.press("ArrowRight");
    await test.expect(lastItem).toBeFocused();
  });
});

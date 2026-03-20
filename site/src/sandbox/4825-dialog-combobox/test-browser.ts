import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("combobox input preserves scroll position when results change", async ({
    page,
    q,
  }) => {
    const combobox = q.combobox();
    await test.expect(combobox).toBeFocused();

    // Type padding spaces followed by "b" to overflow and match multiple items.
    // "b" matches Banana and Blueberry. Adding "a" will change results to just
    // Banana, triggering the async autoSelect effect which causes the virtual
    // focus dance that resets scrollLeft.
    await page.keyboard.type("                  b", { delay: 20 });

    // Verify items are rendered
    await test.expect(q.option("Banana")).toBeVisible();
    await test.expect(q.option("Blueberry")).toBeVisible();

    await test.expect
      .poll(() =>
        combobox.evaluate((el) => (el as HTMLInputElement).scrollLeft),
      )
      .toBeGreaterThan(0);

    // Type "a" to change results from [Banana, Blueberry] to [Banana] only.
    // This triggers an async item change (via startTransition), which fires the
    // autoSelect effect and the virtual focus dance.
    await page.keyboard.type("a", { delay: 20 });

    await test.expect(q.option("Blueberry")).toBeHidden();

    // scrollLeft should be preserved (not reset to 0)
    await test.expect
      .poll(() =>
        combobox.evaluate((el) => (el as HTMLInputElement).scrollLeft),
      )
      .toBeGreaterThan(0);
  });
});

import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("combobox input preserves scroll position when results change", async ({
    page,
    q,
  }) => {
    const combobox = q.combobox();
    await test.expect(combobox).toBeFocused();

    // Type text that overflows the narrow input (width: 100px) and produces
    // results. The filter uses includes() with trim(), so leading spaces make
    // the text overflow while still matching items.
    await page.keyboard.type("                  ber", { delay: 20 });
    await page.waitForTimeout(200);

    // Verify items are rendered (autoSelect will fire)
    await test.expect(q.option("Blueberry")).toBeVisible();

    // Scroll position should be > 0 because text overflows the input
    const scrollLeft1 = await combobox.evaluate(
      (el) => (el as HTMLInputElement).scrollLeft,
    );
    test.expect(scrollLeft1).toBeGreaterThan(0);

    // Simulate what the autoSelect effect does when results change: it calls
    // store.move() which triggers focusIntoView(item) in composite.tsx. This
    // briefly moves DOM focus to the item and back, resetting scrollLeft.
    const scrollLeftAfterDance = await combobox.evaluate((el) => {
      const input = el as HTMLInputElement;
      const item = document.querySelector("[role='option']") as HTMLElement;
      if (item) {
        item.focus({ preventScroll: true });
        item.scrollIntoView({ block: "nearest", inline: "nearest" });
        input.focus({ preventScroll: true });
      }
      return input.scrollLeft;
    });

    // scrollLeft should be preserved after the virtual focus dance
    test.expect(scrollLeftAfterDance).toBeGreaterThan(0);
  });
});

import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("extends the inline completion with Shift+ArrowLeft before replacement", async ({
    page,
    q,
  }) => {
    const combobox = q.combobox();
    await combobox.click();
    await page.keyboard.type("ap");
    await test.expect(combobox).toHaveValue("apple");
    // Mac selections can have no direction until a Shift+Arrow moves an edge.
    await test.expect
      .poll(() =>
        combobox.evaluate((element) => {
          if (!(element instanceof HTMLInputElement)) {
            throw new Error("Expected an input");
          }
          return [
            element.selectionStart,
            element.selectionEnd,
            element.selectionDirection,
          ];
        }),
      )
      .toEqual([2, 5, "none"]);

    await page.keyboard.press("Shift+ArrowRight");
    await page.keyboard.press("Shift+ArrowLeft");
    await page.keyboard.type("X");

    await test.expect(combobox).toHaveValue("aX");
  });
});

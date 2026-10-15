import { withFramework } from "#app/test-utils/preview.ts";

const grids = ["Vertical contacts", "Horizontal contacts", "Both contacts"];

withFramework(import.meta.dirname, async ({ test, query }) => {
  // https://github.com/ariakit/ariakit/issues/7894
  test("Left and Right move the text cursor before leaving the field", async ({
    page,
    q,
  }) => {
    for (const grid of grids) {
      const fields = query(q.grid(grid));
      const firstName = fields.textbox("First contact name");
      const firstNotes = fields.textbox("First contact notes");

      await firstName.click();
      await page.keyboard.type("ab");
      await page.keyboard.press("ArrowLeft");
      await test.expect(firstName).toBeFocused();
      await test.expect(firstName).toHaveJSProperty("selectionStart", 1);

      await page.keyboard.press("ArrowRight");
      await test.expect(firstName).toBeFocused();
      await test.expect(firstName).toHaveJSProperty("selectionStart", 2);

      await page.keyboard.press("ArrowRight");
      await test.expect(firstNotes).toBeFocused();

      await page.keyboard.type("cd");
      await page.keyboard.press("ArrowLeft");
      await test.expect(firstNotes).toBeFocused();
      await test.expect(firstNotes).toHaveJSProperty("selectionStart", 1);

      await page.keyboard.press("ArrowLeft");
      await test.expect(firstNotes).toBeFocused();
      await test.expect(firstNotes).toHaveJSProperty("selectionStart", 0);

      await page.keyboard.press("ArrowLeft");
      await test.expect(firstName).toBeFocused();
    }
  });

  // https://github.com/ariakit/ariakit/issues/7894
  test("Up and Down move the text cursor before leaving the field", async ({
    page,
    q,
  }) => {
    for (const grid of grids) {
      const fields = query(q.grid(grid));
      const firstNotes = fields.textbox("First contact notes");
      const secondNotes = fields.textbox("Second contact notes");

      await firstNotes.click();
      await page.keyboard.type("ab\ncd");
      await page.keyboard.press("ArrowUp");
      await test.expect(firstNotes).toBeFocused();
      await test.expect(firstNotes).toHaveJSProperty("selectionStart", 2);

      await page.keyboard.press("ArrowDown");
      await test.expect(firstNotes).toBeFocused();
      await test.expect(firstNotes).toHaveJSProperty("selectionStart", 5);

      await page.keyboard.press("ArrowDown");
      await test.expect(secondNotes).toBeFocused();

      // An empty first line makes Up land on the start of the text in every
      // engine, so the next Up starts at the text boundary.
      await page.keyboard.type("\ngh");
      await page.keyboard.press("ArrowUp");
      await test.expect(secondNotes).toBeFocused();
      await test.expect(secondNotes).toHaveJSProperty("selectionStart", 0);

      await page.keyboard.press("ArrowUp");
      await test.expect(firstNotes).toBeFocused();
    }
  });
});

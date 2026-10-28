import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("names the color group with the picked color", async ({ page, q }) => {
    await test
      .expect(query(q.radiogroup("Color: Sage")).radio("Sage"))
      .toBeChecked();
    // The swatches have no text, so the keyboard picks the next color.
    await page.keyboard.press("Tab");
    await test.expect(q.radio("Sage")).toBeFocused();
    await page.keyboard.press("ArrowRight");
    await test
      .expect(query(q.radiogroup("Color: Navy")).radio("Navy"))
      .toBeChecked();
  });

  test("leaves the size group with one Tab press", async ({ page, q }) => {
    await query(q.radiogroup("Size")).text("M").click();
    await test.expect(q.radio("M")).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(q.button("Add Sage jacket, size M")).toBeFocused();
  });
});

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

  test("tells that a size is sold out and adds the picked size", async ({
    q,
  }) => {
    const sizes = query(q.radiogroup("Size"));
    const soldOut = sizes.radio("XL");
    await test.expect(soldOut).toBeDisabled();
    await test
      .expect(soldOut)
      .toHaveAccessibleDescription("Sold out. Back on 20 November.");
    await test.expect(q.button("Select a size")).toBeDisabled();
    await sizes.text("M").click();
    await test.expect(q.button("Add Sage jacket, size M")).toBeEnabled();
  });

  test("leaves the size group with one Tab press", async ({ page, q }) => {
    await query(q.radiogroup("Size")).text("M").click();
    await test.expect(q.radio("M")).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(q.button("Add Sage jacket, size M")).toBeFocused();
  });

  test("shows when a sold-out size comes back on hover", async ({ q }) => {
    const label = query(q.radiogroup("Size")).text("XL");
    // Ariakit resets hover intent on scroll, so the anchor must be in view
    // before the pointer moves over it.
    await label.scrollIntoViewIfNeeded();
    await label.hover();
    await test
      .expect(q.tooltip("Sold out. Back on 20 November."))
      .toBeVisible();
  });
});

import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // Regression: when FormRadio is inside a RadioProvider, the radio store's
  // auto-generated id must not override the form field name attribute.
  test("FormRadio uses form field name inside RadioProvider", async ({ q }) => {
    const names = await q
      .radio("Red")
      .or(q.radio("Green"))
      .or(q.radio("Blue"))
      .evaluateAll((els) => els.map((el) => (el as HTMLInputElement).name));

    test.expect(names.length).toBe(3);
    for (const name of names) {
      test.expect(name).toBe("color");
    }
  });

  test("validation error shows after blur", async ({ page, q }) => {
    await q.radio("Red").focus();
    await page.keyboard.press("Tab");
    await test.expect(q.text("Please select a color.")).toBeVisible();
  });
});

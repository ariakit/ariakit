import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("shows the error panel when focus leaves an invalid field", async ({
    page,
    q,
  }) => {
    const field = q.textbox("Username");
    // The live region is in the accessibility tree before its text.
    const error = q.alert();
    await test.expect(error).toBeEmpty();
    await test.expect(field).not.toHaveAttribute("aria-invalid");
    await test
      .expect(field)
      .toHaveAccessibleDescription("Use letters, numbers, and dashes.");
    await field.focus();
    await page.keyboard.press("Tab");
    await test.expect(error).toHaveText("Remove the spaces.");
    await test.expect(field).toHaveAttribute("aria-invalid", "true");
    await test
      .expect(field)
      .toHaveAccessibleDescription(
        "Remove the spaces. Use letters, numbers, and dashes.",
      );
  });

  test("hides the empty error panel and clears it once the value is valid", async ({
    page,
    q,
  }) => {
    const field = q.textbox("Username");
    const error = q.alert();
    // The empty panel is visually hidden, so it paints no box.
    await test.expect(error).toHaveCSS("position", "absolute");
    await field.focus();
    await page.keyboard.press("Tab");
    await test.expect(error).toHaveText("Remove the spaces.");
    await test.expect(error).toHaveCSS("position", "static");
    await field.fill("ada-lovelace");
    await test.expect(error).toBeEmpty();
    await test.expect(error).toHaveCSS("position", "absolute");
    await test.expect(field).not.toHaveAttribute("aria-invalid");
  });
});

import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("names and describes the horizontal fields", async ({ q }) => {
    await test
      .expect(q.textbox("Full name"))
      .toHaveAccessibleDescription("Used on invoices.");
    await test
      .expect(q.textbox("Phone"))
      .toHaveAccessibleDescription("Enter the full number.");
    await test
      .expect(q.textbox("Phone"))
      .toHaveAttribute("aria-invalid", "true");
  });

  test("puts the label beside the field and stacks it when narrow", async ({
    page,
    q,
  }) => {
    const label = q.text("Full name");
    const field = q.textbox("Full name");
    const hint = q.text("Used on invoices.");
    await page.setViewportSize({ width: 1024, height: 800 });
    await test.expect
      .poll(async () => {
        const [labelBox, fieldBox, hintBox] = await Promise.all([
          label.boundingBox(),
          field.boundingBox(),
          hint.boundingBox(),
        ]);
        if (!labelBox || !fieldBox || !hintBox) return null;
        return {
          // The label box reaches the field, so a click in the gap focuses it.
          beside: fieldBox.x >= labelBox.x + labelBox.width,
          hintUnderField: Math.round(hintBox.x) === Math.round(fieldBox.x),
        };
      })
      .toEqual({ beside: true, hintUnderField: true });
    await page.setViewportSize({ width: 320, height: 800 });
    await test.expect
      .poll(async () => {
        const [labelBox, fieldBox] = await Promise.all([
          label.boundingBox(),
          field.boundingBox(),
        ]);
        if (!labelBox || !fieldBox) return null;
        return fieldBox.y >= labelBox.y + labelBox.height;
      })
      .toBe(true);
  });

  test("focuses the field from a click between the label and the field", async ({
    page,
    q,
  }) => {
    const field = q.textbox("Full name");
    await page.setViewportSize({ width: 1024, height: 800 });
    const label = await q.text("Full name").boundingBox();
    const box = await field.boundingBox();
    test.expect(label).not.toBeNull();
    test.expect(box).not.toBeNull();
    if (!label || !box) return;
    // The column gap between the label and the field belongs to neither element
    // without the label padding.
    await page.mouse.click(box.x - 4, label.y + label.height / 2);
    await test.expect(field).toBeFocused();
  });
});

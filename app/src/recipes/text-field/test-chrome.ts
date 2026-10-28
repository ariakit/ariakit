import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("focuses the field from a click between the label and the field", async ({
    page,
    q,
  }) => {
    const field = q.textbox("Display name");
    const label = await q.text("Display name").boundingBox();
    const box = await field.boundingBox();
    test.expect(label).not.toBeNull();
    test.expect(box).not.toBeNull();
    if (!label || !box) return;
    // The gap between the label and the field belongs to neither element.
    await page.mouse.click(label.x + 4, box.y - 2);
    await test.expect(field).toBeFocused();
  });
});

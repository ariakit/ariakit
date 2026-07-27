import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // examples/select-autofill/test.ts
  test("mirrors native autofill and redirects native focus", async ({
    page,
    q,
  }) => {
    const select = q.combobox("Role");
    const nativeSelect = page.locator('select[name="role"]');

    await nativeSelect.selectOption("Tutor");
    await test.expect(select).toHaveAttribute("data-autofill");
    await test.expect(select).toHaveText("Tutor");

    await nativeSelect.focus();
    await test.expect(select).toBeFocused();
  });
});

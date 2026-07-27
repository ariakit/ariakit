import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // examples/select-form-disabled/test.ts
  test("is disabled and omitted from form submission", async ({ q }) => {
    const select = q.combobox("Favorite fruit");
    await test.expect(select).toBeDisabled();
    await test.expect(select).toHaveAttribute("aria-disabled", "true");

    await q.button("Submit").click();
    await test.expect(q.status()).toHaveText("Submitted: null");
  });
});

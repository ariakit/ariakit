import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("show validation errors for nested array fields", async ({
    page,
    q,
  }) => {
    // Both fields are empty, submit should show errors
    await q.button("Submit").click();

    // Both error messages should be visible
    await test.expect(q.text("Name is required").first()).toBeVisible();
    await test.expect(q.text("Name is required").last()).toBeVisible();
  });

  test("clear error when nested field is filled", async ({ page, q }) => {
    await q.button("Submit").click();
    await test.expect(q.text("Name is required").first()).toBeVisible();

    // Fill the first field
    await q.textbox("Item 1 name").click();
    await page.keyboard.type("Alice");

    // Submit again - first error should be gone, second should remain
    await q.button("Submit").click();
    await test.expect(q.text("Name is required")).toHaveCount(1);
  });
});

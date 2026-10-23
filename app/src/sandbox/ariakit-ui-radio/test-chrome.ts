import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("names a field by its label and describes it by its description", async ({
    q,
  }) => {
    const box = query(q.article("Descriptions"));
    const hobby = box.radio("Hobby");
    await test
      .expect(hobby)
      .toHaveAccessibleDescription("For side projects and experiments");
    // The label points at the input, so the name doesn't depend on the label
    // wrapping it.
    const id = await hobby.getAttribute("id");
    await test
      .expect(hobby.locator("xpath=ancestor::label"))
      .toHaveAttribute("for", id ?? "");
    // The description is still part of the row, so clicking it checks the
    // radio.
    await box.text("For side projects and experiments").click();
    await test.expect(hobby).toBeChecked();
  });

  test("leaves a field without a description undescribed", async ({ q }) => {
    const radio = query(q.article("Group")).radio("Pro");
    await test.expect(radio).toBeVisible();
    await test.expect(radio).not.toHaveAttribute("aria-describedby");
  });

  test("names a card by its label and describes it by its description", async ({
    q,
  }) => {
    const box = query(q.article("Cards"));
    const hobby = box.radio("Hobby");
    await test
      .expect(hobby)
      .toHaveAccessibleDescription("For side projects and experiments");
    await box.text("For side projects and experiments").click();
    await test.expect(hobby).toBeChecked();
  });
});

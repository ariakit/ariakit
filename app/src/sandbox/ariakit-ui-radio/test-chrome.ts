import { getBackgroundContrast } from "#app/test-utils/contrast.ts";
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

  // The fill of a checked radio is its boundary, so it keeps 3:1 against the
  // brand surface around it, as WCAG 1.4.11 asks for the state of a control.
  // https://github.com/ariakit/ariakit/issues/8080
  test("keeps a checked radio at 3:1 against a brand layer", async ({
    page,
    q,
  }) => {
    const radio = query(q.article("Group on a brand layer")).radio("Pro");
    for (const colorScheme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme });
      await test.expect(radio).toBeChecked();
      await test.expect
        .poll(() => getBackgroundContrast(radio), {
          message: colorScheme,
        })
        .toBeGreaterThanOrEqual(3);
    }
  });
});

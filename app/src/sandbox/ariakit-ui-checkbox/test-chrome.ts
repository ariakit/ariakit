import { getBackgroundContrast } from "#app/test-utils/contrast.ts";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("names a field by its label and describes it by its description", async ({
    q,
  }) => {
    const box = query(q.article("Field with description"));
    const checkbox = box.checkbox();
    await test.expect(checkbox).toHaveAccessibleName("Product updates");
    await test
      .expect(checkbox)
      .toHaveAccessibleDescription("New features and changes to the API");
    // The label points at the input, so the name doesn't depend on the label
    // wrapping it.
    const id = await checkbox.getAttribute("id");
    await test
      .expect(checkbox.locator("xpath=ancestor::label"))
      .toHaveAttribute("for", id ?? "");
    // The description is still part of the row, so clicking it toggles the box.
    await box.text("New features and changes to the API").click();
    await test.expect(checkbox).not.toBeChecked();
  });

  test("describes a field by its own description id, then by the app hint", async ({
    q,
  }) => {
    const box = query(q.article("Field with app ids"));
    await test.expect(box.checkbox()).toHaveAccessibleName("Usage reports");
    await test
      .expect(box.checkbox())
      .toHaveAccessibleDescription(
        "Anonymous crash and usage data You can change this later in settings",
      );
  });

  test("leaves a field without a description undescribed", async ({ q }) => {
    const checkbox = query(q.article("Checkbox field")).checkbox();
    await test.expect(checkbox).toHaveAccessibleName("Remember me");
    await test.expect(checkbox).not.toHaveAttribute("aria-describedby");
  });

  test("names a card by its label and describes it by its description", async ({
    q,
  }) => {
    const box = query(q.article("Card with description"));
    const checkbox = box.checkbox();
    await test.expect(checkbox).toHaveAccessibleName("Analytics");
    await test
      .expect(checkbox)
      .toHaveAccessibleDescription(
        "Usage, retention and funnel reports, refreshed every hour",
      );
    await box
      .text("Usage, retention and funnel reports, refreshed every hour")
      .click();
    await test.expect(checkbox).not.toBeChecked();
  });

  test("select all reflects and toggles its children", async ({ q }) => {
    const box = query(q.article("Select all"));
    const parent = box.checkbox("All features");
    const children = query(box.group("Features"));
    const alerts = children.checkbox("Alerts");
    const analytics = children.checkbox("Analytics");

    await test.expect(parent).toHaveAttribute("aria-checked", "mixed");
    await test.expect(alerts).toBeChecked();
    // The parent names the children it controls.
    const controls = await parent.getAttribute("aria-controls");
    const childIds = await children
      .checkbox()
      .evaluateAll((nodes) => nodes.map((node) => node.id));
    test.expect(controls?.split(" ")).toEqual(childIds);

    await parent.click();
    await test.expect(parent).toBeChecked();
    for (const child of await children.checkbox().all()) {
      await test.expect(child).toBeChecked();
    }

    await parent.click();
    await test.expect(parent).not.toBeChecked();
    for (const child of await children.checkbox().all()) {
      await test.expect(child).not.toBeChecked();
    }

    await analytics.click();
    await test.expect(analytics).toBeChecked();
    await test.expect(parent).toHaveAttribute("aria-checked", "mixed");
  });

  test("a card grid is a named group of cards", async ({ q }) => {
    const box = query(q.article("Card grid"));
    const grid = query(box.group("Features"));
    await test.expect(grid.checkbox()).toHaveCount(4);
    await test.expect(box.text("1 of 4 selected")).toBeVisible();
    // The input is visually hidden, so a user clicks the card around it.
    await grid.text("Alerts").click();
    await test.expect(grid.checkbox("Alerts")).toBeChecked();
    await test.expect(box.text("2 of 4 selected")).toBeVisible();
  });
  // A role prop that is present but undefined, as a wrapper with an optional
  // role passes it, must keep the grid's own group role.
  test("keeps the group role of a card grid whose role prop is undefined", async ({
    q,
  }) => {
    await test.expect(q.group("Optional role")).toBeVisible();
  });

  // The fill of a checked box is its boundary, so it keeps 3:1 against the
  // brand surface around it, as WCAG 1.4.11 asks for the state of a control.
  // https://github.com/ariakit/ariakit/issues/8080
  test("keeps a checked box at 3:1 against a brand layer", async ({
    page,
    q,
  }) => {
    for (const colorScheme of ["light", "dark"] as const) {
      await page.emulateMedia({ colorScheme });
      for (const example of [
        "Fields on a brand layer",
        "Bordered fields on a brand layer",
      ]) {
        const checkbox = query(q.article(example)).checkbox("Email me");
        await test.expect(checkbox).toBeChecked();
        await test.expect
          .poll(() => getBackgroundContrast(checkbox), {
            message: `${example} in ${colorScheme}`,
          })
          .toBeGreaterThanOrEqual(3);
      }
    }
  });
});

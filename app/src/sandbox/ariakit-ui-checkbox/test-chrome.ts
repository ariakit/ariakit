import { getBackgroundContrast } from "#app/test-utils/contrast.ts";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("shows the pointer on enabled inputs and rows only", async ({ q }) => {
    const bare = query(q.article("Default")).checkbox("Select row");
    await test.expect(bare).toHaveCSS("cursor", "pointer");
    const field = query(q.article("Checkbox field"));
    await test
      .expect(field.checkbox("Remember me"))
      .toHaveCSS("cursor", "pointer");
    await test.expect(field.text("Remember me")).toHaveCSS("cursor", "pointer");
    const disabled = query(q.article("Disabled field"));
    await test
      .expect(disabled.checkbox("Beta program"))
      .toHaveCSS("cursor", "not-allowed");
    await test
      .expect(disabled.text("Beta program"))
      .toHaveCSS("cursor", "not-allowed");
  });

  test("lets a plain cursor utility replace the pointer", async ({ q }) => {
    const example = query(q.article("Custom cursor"));
    await test
      .expect(example.checkbox("Arrow box"))
      .toHaveCSS("cursor", "default");
    await test.expect(example.text("Arrow row")).toHaveCSS("cursor", "default");
    await test
      .expect(example.checkbox("Arrow row"))
      .toHaveCSS("cursor", "default");
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

  test("names the cards of a grid by the group around it", async ({ q }) => {
    const box = query(q.article("Card grid"));
    // The grid only lays out the cards, so the fieldset is the only group.
    await test.expect(box.group()).toHaveCount(1);
    const group = query(box.group("Features"));
    await test.expect(group.checkbox()).toHaveCount(4);
    await test.expect(box.text("1 of 4 selected")).toBeVisible();
    // The input is visually hidden, so a user clicks the card around it.
    await group.text("Alerts").click();
    await test.expect(group.checkbox("Alerts")).toBeChecked();
    await test.expect(box.text("2 of 4 selected")).toBeVisible();
  });

  test("passes a role from the app on to a card grid", async ({ q }) => {
    const grid = query(q.group("Caller role"));
    await test.expect(grid.checkbox()).toHaveCount(2);
  });

  test("names a checkbox group by its legend", async ({ q }) => {
    const box = query(q.article("Labeled group"));
    await test
      .expect(box.group("Email me about"))
      .toHaveAccessibleDescription("We send at most one email a day.");
    const group = query(box.group("Email me about"));
    await test.expect(group.checkbox()).toHaveCount(3);
    await test.expect(group.checkbox("Comments")).toBeChecked();
    await group.text("Mentions").click();
    await test.expect(group.checkbox("Mentions")).toBeChecked();
  });

  test("disables every checkbox in a disabled group", async ({ q }) => {
    const group = query(q.group("Beta features"));
    const summaries = group.checkbox("AI summaries");
    const themes = group.checkbox("Custom themes");
    await test.expect(summaries).toBeDisabled();
    await test.expect(themes).toBeDisabled();
    await test.expect(summaries).toBeChecked();
    // Playwright waits for content in a disabled fieldset to become enabled, so
    // hover checks that the row receives the pointer, and force skips the wait.
    // The click toggles an enabled box before it resolves, so the box below
    // would already be checked if the click reached it.
    const row = group.text("Custom themes");
    await row.hover();
    await row.click({ force: true });
    await test.expect(themes).not.toBeChecked();
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

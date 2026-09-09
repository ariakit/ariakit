import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974019389
  test("preserves a zero description and omits a false description", async ({
    q,
  }) => {
    const button = q.button("Pending requests");
    await test.expect(button).toHaveAccessibleDescription("0");
    await test.expect(button).toHaveText("Pending requests0");
    await button.click();
    await test.expect(q.text("No requests need review")).toBeVisible();
    const archived = q.button("Archived requests");
    await test.expect(archived).not.toHaveAttribute("aria-describedby");
    await test.expect(archived).not.toHaveAttribute("aria-labelledby");
  });
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972224162
  test("omits optional headings without hiding the filters", async ({
    q,
    page,
  }) => {
    await test.expect(q.combobox("Assignee")).toBeVisible();
    await test.expect(q.combobox("Status")).toBeVisible();
    await test.expect(q.button("")).toHaveCount(0);
    await test
      .expect(page.locator("label").filter({ hasText: /^$/ }))
      .toHaveCount(0);
    await q.combobox("Assignee").click();
    await test.expect(q.option("Alice")).toBeVisible();
    await test.expect(q.group()).not.toHaveAttribute("aria-labelledby");
    await q.combobox("Assignee").press("Escape");
    await q.checkbox("Show filter headings").check();
    await test.expect(q.button("Project filters")).toBeVisible();
    await test.expect(q.combobox("Assignee")).not.toBeVisible();
    await q.button("Project filters").click();
    await test.expect(q.combobox("Assignee")).toBeVisible();
    await q.combobox("Assignee").click();
    await test.expect(q.group("Team")).toBeVisible();
    await q.combobox("Assignee").press("Escape");
    await q.button("0").click();
    await test.expect(q.text("No pending requests")).toBeVisible();
  });
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972224487
  test("names a disclosure from its description without a missing label", async ({
    q,
  }) => {
    const button = q.button("Advanced options");
    await test.expect(button).not.toHaveAttribute("aria-labelledby");
    await test.expect(button).toHaveAccessibleDescription("Advanced options");
    await button.click();
    await test.expect(q.text("Advanced controls")).toBeVisible();
  });
});

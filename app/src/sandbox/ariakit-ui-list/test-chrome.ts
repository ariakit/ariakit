import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("keeps a disclosure step's checked state in its name", async ({ q }) => {
    const button = query(q.article("Disclosure steps")).button(
      "Checked Connect the repository",
    );
    await test.expect(button).toHaveAccessibleDescription("Done on Monday");
  });

  // https://github.com/ariakit/ariakit/pull/7494#discussion_r3995263562
  test("keeps a disclosure badge beside the label without a description", async ({
    q,
  }) => {
    const example = query(q.article("Disclosure badges"));
    const button = example.button("Project tasks 3");
    await test
      .expect(button.locator(":scope > span").filter({ hasText: /^3$/ }))
      .toHaveCount(1);
    await button.click();
    await test.expect(example.text("Manage project tasks")).toBeHidden();
  });

  // https://github.com/ariakit/ariakit/pull/7494#discussion_r3995263562
  test("keeps a disclosure badge beside the label with a description", async ({
    q,
  }) => {
    const example = query(q.article("Disclosure badges"));
    const button = example.button("Team tasks");
    await test
      .expect(button)
      .toHaveAttribute("aria-labelledby", "list-tasks-label");
    await test
      .expect(button)
      .toHaveAccessibleDescription("All tasks in this workspace");
    await test
      .expect(button.locator(":scope > span").filter({ hasText: /^3$/ }))
      .toHaveCount(1);
    await button.click();
    await test.expect(example.text("Manage team tasks")).toBeHidden();
  });

  test("describes the value of a progress marker", async ({ q }) => {
    const row = query(q.article("Checklist"))
      .listitem()
      .filter({ hasText: "Collect the replies" });
    const marker = query(row).img("Unchecked");
    await test.expect(marker).toHaveAccessibleDescription("65% complete");

    const done = query(q.article("Checklist"))
      .listitem()
      .filter({ hasText: "Book the venue" });
    await test
      .expect(query(done).img("Checked"))
      .toHaveAccessibleDescription("");
  });

  test("describes the value of a standalone progress marker", async ({ q }) => {
    const entry = query(q.article("Status legend")).text("In progress");
    await test
      .expect(query(entry).img("Unchecked"))
      .toHaveAccessibleDescription("70% complete");
  });

  // Sections mode used to match only h1 to h4, so the deep sections box needs
  // headings at level five to cover the rhythm that its capture shows.
  test("nests the deep sections headings at level five", async ({ q }) => {
    await test
      .expect(
        query(q.article("Deep sections")).heading("Two-factor sign-in", {
          level: 5,
        }),
      )
      .toBeVisible();
    await test
      .expect(query(q.article("Sections")).heading("Account", { level: 3 }))
      .toBeVisible();
  });

  // Regression fixtures.
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3973584702
  test("omits a conditional list button without hiding its content", async ({
    q,
  }) => {
    const scope = query(q.article("list-disclosure-optional-button"));
    await test.expect(scope.text("Review assigned issues")).toBeVisible();
    await test.expect(scope.button("")).toHaveCount(0);

    await scope.checkbox("Show task headings").check();
    await test.expect(scope.button("Project tasks")).toBeVisible();
    await test.expect(scope.text("Review assigned issues")).toBeHidden();
    await scope.button("Project tasks").click();
    await test.expect(scope.text("Review assigned issues")).toBeVisible();
    await scope.button("Project tasks").click();
    await test.expect(scope.text("Review assigned issues")).toBeHidden();

    await scope.checkbox("Show task headings").uncheck();
    await test.expect(scope.text("Review assigned issues")).toBeVisible();
    await test.expect(scope.button("Project tasks")).toHaveCount(0);
    await test.expect(scope.button("")).toHaveCount(0);
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3973584702
  test("keeps zero as a list button label", async ({ q }) => {
    const scope = query(q.article("list-disclosure-optional-button"));
    const button = scope.button("0");
    await test.expect(button).toBeVisible();
    await test.expect(button).toHaveAttribute("aria-expanded", "false");
    await button.click();
    await test.expect(button).toHaveAttribute("aria-expanded", "true");
    await test.expect(scope.text("No pending tasks")).toBeVisible();
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3973781710
  test("uses progress as the default check state and preserves explicit values", async ({
    q,
  }) => {
    const scope = query(q.article("list-item-marker-checked"));
    const completed = query(scope.list("Completed progress"));
    const unchecked = query(scope.list("Explicit unchecked state"));
    const checked = query(scope.list("Explicit checked state"));
    await test.expect(completed.img("Checked")).toBeVisible();
    await test.expect(unchecked.img("Unchecked")).toBeVisible();
    await test.expect(checked.img("Checked")).toBeVisible();
  });

  test("keeps the name and the description of markers whose props are undefined", async ({
    q,
  }) => {
    const box = query(q.article("Markers with optional props"));
    await test.expect(box.img("Checked")).toBeVisible();
    await test
      .expect(box.img("Unchecked"))
      .toHaveAccessibleDescription("50% complete");
  });
});

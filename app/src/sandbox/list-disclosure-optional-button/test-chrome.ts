import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3973584702
  test("omits a conditional list button without hiding its content", async ({
    q,
  }) => {
    await test.expect(q.text("Review assigned issues")).toBeVisible();
    await test.expect(q.button("")).toHaveCount(0);

    await q.checkbox("Show task headings").check();
    await test.expect(q.button("Project tasks")).toBeVisible();
    await test.expect(q.text("Review assigned issues")).toBeHidden();
    await q.button("Project tasks").click();
    await test.expect(q.text("Review assigned issues")).toBeVisible();
    await q.button("Project tasks").click();
    await test.expect(q.text("Review assigned issues")).toBeHidden();

    await q.checkbox("Show task headings").uncheck();
    await test.expect(q.text("Review assigned issues")).toBeVisible();
    await test.expect(q.button("Project tasks")).toHaveCount(0);
    await test.expect(q.button("")).toHaveCount(0);
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3973584702
  test("keeps zero as a list button label", async ({ q }) => {
    const button = q.button("0");
    await test.expect(button).toBeVisible();
    await test.expect(button).toHaveAttribute("aria-expanded", "false");
    await button.click();
    await test.expect(button).toHaveAttribute("aria-expanded", "true");
    await test.expect(q.text("No pending tasks")).toBeVisible();
  });
});

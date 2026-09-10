import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3972224343
  test("keeps an editable input when an optional render is undefined", async ({
    q,
  }) => {
    await q.textbox("Project name").fill("Website");
    await test.expect(q.text("Project: Website")).toBeVisible();
    await q.textbox("Notes").fill("First line\nSecond line");
    await test
      .expect(q.textbox("Notes"))
      .toHaveValue("First line\nSecond line");
  });
});

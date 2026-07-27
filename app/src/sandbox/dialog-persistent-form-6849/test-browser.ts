import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/6849
  test("keeps descendants of a persistent form inside the dialog context", async ({
    page,
    q,
  }) => {
    await q.button("Open dialog").click();
    await test.expect(q.dialog("Dialog")).toBeVisible();

    await q.textbox("Persistent field").click();
    await test.expect(q.textbox("Persistent field")).toBeFocused();
    await page.waitForTimeout(250);
    await test.expect(q.dialog("Dialog")).toBeVisible();

    await q.textbox("Outside field").click();
    await test.expect(q.dialog("Dialog")).not.toBeVisible();
  });
});

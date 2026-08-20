import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7225
  test("resolves the focused element past a named form", async ({ q }) => {
    const button = q.button("Check active element");
    await button.focus();
    await button.press("Enter");

    await test
      .expect(q.status("Active element result"))
      .toHaveText("Focused button");
  });

  // https://github.com/ariakit/ariakit/issues/7225
  test("checks a form with a control named tagName", async ({ q }) => {
    await q.button("Check button type").click();

    await test.expect(q.status("Button result")).toHaveText("Not a button");
  });

  // https://github.com/ariakit/ariakit/issues/7225
  test("checks visibility with controls named after DOM members", async ({
    q,
  }) => {
    await q.button("Check visibility").click();

    await test.expect(q.status("Visibility result")).toHaveText("Visible");
  });
});

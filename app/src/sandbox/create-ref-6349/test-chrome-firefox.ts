import { withFramework } from "#app/test-utils/preview.ts";

// Reproduces https://github.com/ariakit/ariakit/issues/6349
withFramework(import.meta.dirname, async ({ test }) => {
  test("resets a function-typed ref to its initial value", async ({ q }) => {
    await test.expect(q.text("Stored value type: function")).toBeVisible();

    await q.button("Use email handler").click();
    await q.button("Focus field").click();
    await test.expect(q.textbox("Email")).toBeFocused();

    await q.button("Restore default").click();
    await test.expect(q.textbox("Name")).not.toBeFocused();
    await test.expect(q.text("Stored value type: function")).toBeVisible();

    await q.button("Focus field").click();
    await test.expect(q.textbox("Name")).toBeFocused();
  });
});

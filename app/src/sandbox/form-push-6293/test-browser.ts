import { withFramework } from "#app/test-utils/preview.ts";

// Reproduces https://github.com/ariakit/ariakit/issues/6293
withFramework(import.meta.dirname, async ({ test }) => {
  test("FormPush focuses the field it creates after an existing item", async ({
    q,
  }) => {
    await q.button("Add tag").click();
    await test.expect(q.textbox("tags.1")).toBeFocused();
    await test.expect(q.status()).toHaveText("Focused field: tags.1");
  });

  test("FormPush keeps auto-focusing fields in an initially empty array", async ({
    q,
  }) => {
    await q.button("Add email").click();
    await test.expect(q.textbox("emails.0")).toBeFocused();
    await test.expect(q.status()).toHaveText("Focused field: emails.0");

    await q.button("Add email").click();
    await test.expect(q.textbox("emails.1")).toBeFocused();
    await test.expect(q.status()).toHaveText("Focused field: emails.1");
  });
});

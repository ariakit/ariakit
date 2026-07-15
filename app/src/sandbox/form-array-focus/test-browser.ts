import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // Reproduces https://github.com/ariakit/ariakit/issues/6293
  test("FormPush focuses the field it creates after an existing item", async ({
    q,
  }) => {
    await q.button("Add tag").click();
    await test.expect(q.textbox("tags.2")).toBeFocused();
    await test.expect(q.status()).toHaveText("Focused field: tags.2");
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

  // Reproduces https://github.com/ariakit/ariakit/issues/6219
  test("FormPush keeps focus within the target array, not a sibling sharing the name prefix", async ({
    q,
  }) => {
    // `tags` and `tags2` are separate arrays, and `tags` is a prefix of `tags2`.
    await q.button("Add tag").click();
    // Auto-focus must stay on a `tags` field (mirrored by the status output) and
    // never leak into the `tags2` sibling, whose name shares the `tags` prefix.
    await test.expect(q.status()).toHaveText(/^Focused field: tags\.\d+$/);
  });

  test("FormRemove keeps focus within the target array, not a sibling sharing the name prefix", async ({
    q,
  }) => {
    // Removing from `tags` must move focus to another `tags` field and never
    // leak into the `tags2` sibling, whose name shares the `tags` prefix.
    await q.button("Remove tags.0").click();
    await test.expect(q.textbox("tags.1")).toBeFocused();
  });

  test("FormPush keeps focus within an array whose name has regex metacharacters", async ({
    q,
  }) => {
    // The `c++` array name contains regex metacharacters. Building the auto-focus
    // matcher must not throw, and focus must stay within the array.
    await q.button("Add version").click();
    await test.expect(q.status()).toHaveText(/^Focused field: c\+\+\.\d+$/);
  });

  test("FormRemove moves focus to the next field when the array name has regex metacharacters", async ({
    q,
  }) => {
    // Removing the first `c++` item must move focus to the next field (`c++.1`)
    // without throwing on the metacharacter name.
    await q.button("Remove c++.0").click();
    await test.expect(q.textbox("c++.1")).toBeFocused();
  });
});

import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/6916
  test("preserves a user-adjusted caret when delayed results update", async ({
    q,
  }) => {
    const combobox = q.combobox("Recipe");

    await combobox.click();
    await combobox.pressSequentially("ap");
    await test.expect(combobox).toHaveValue("apple");
    await combobox.press("ArrowLeft");
    // Keep results pending until after the caret moves. Otherwise, the final
    // assertion could pass without exercising the highlighting effect.
    await test.expect(q.status()).toHaveText("Updating results…");
    await test.expect(q.status()).toHaveText("Results updated");
    await combobox.pressSequentially("pp");
    await test.expect(combobox).toHaveValue("apppple");
  });
});

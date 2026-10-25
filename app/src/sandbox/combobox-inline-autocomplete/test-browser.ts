import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/6916
  test("preserves a user-adjusted caret when delayed results update", async ({
    q,
  }) => {
    const combobox = q.combobox("Recipe");
    const status = q.status();

    await combobox.click();
    // The results update 2 seconds after the last input change, and the caret
    // must move before that. Otherwise, the final assertion could pass without
    // exercising the highlighting effect. A runner stall can exceed that delay,
    // so the input starts over from settled results in that case. Keep the
    // retry deadline inside the test budget so a regression reports the status
    // assertion instead of timing out the whole test.
    await test
      .expect(async () => {
        await combobox.clear();
        await test.expect(status).toHaveText("Results updated");
        await combobox.pressSequentially("ap");
        await test.expect(combobox).toHaveValue("apple");
        await combobox.press("ArrowLeft");
        test.expect(await status.textContent()).toBe("Updating results…");
      })
      .toPass({ timeout: 20_000 });
    await test.expect(status).toHaveText("Results updated");
    await combobox.pressSequentially("pp");
    await test.expect(combobox).toHaveValue("apppple");
  });
});

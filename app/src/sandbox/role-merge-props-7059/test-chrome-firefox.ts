import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7059
  test("an own __proto__ render prop does not remount the element", async ({
    page,
    q,
  }) => {
    const input = q.textbox("Profile name");
    await input.click();
    await page.keyboard.type("Haz");
    await test.expect(input).toHaveValue("Haz");

    await q.button("Refresh payload").click();

    await test.expect(input).toHaveValue("Haz");
  });
});

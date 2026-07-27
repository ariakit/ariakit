import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("validates the radio group on blur and clears the error on change", async ({
    page,
    q,
  }) => {
    const error = q.text("Please select a color.");

    await page.keyboard.press("Tab");
    await test.expect(q.radio("Red")).toBeFocused();
    await test.expect(error).not.toBeVisible();
    await q.button("Submit").focus();
    await test.expect(q.button("Submit")).toBeFocused();
    await test.expect(error).toBeVisible();
    await q.radio("Blue").focus();
    await test.expect(q.radio("Blue")).toBeFocused();
    await page.keyboard.press("Space");
    await test.expect(error).not.toBeVisible();
  });

  test("focuses the first radio when submission fails", async ({ q }) => {
    await q.button("Submit").click();
    await test.expect(q.text("Please select a color.")).toBeVisible();
    await test.expect(q.radio("Red")).toBeFocused();
  });

  test("submits and resets a selected radio", async ({ page, q }) => {
    await q.radio("Green").click();

    await Promise.all([
      page.waitForEvent("dialog").then(async (dialog) => {
        test.expect(dialog.message()).toBe(JSON.stringify({ color: "green" }));
        await dialog.accept();
      }),
      q.button("Submit").click(),
    ]);

    await test.expect(q.radio("Red")).not.toBeChecked();
    await test.expect(q.radio("Green")).not.toBeChecked();
    await test.expect(q.radio("Blue")).not.toBeChecked();
  });
});

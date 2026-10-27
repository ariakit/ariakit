import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("shows the field after the group only while Other is checked", async ({
    page,
    q,
  }) => {
    const field = q.textbox("Where did you hear about us?");
    await test.expect(field).toHaveCount(0);
    await q.radio("Other").click();
    await test.expect(field).toBeVisible();
    // Focus stays on the radio, and Tab moves into the field next.
    await test.expect(q.radio("Other")).toBeFocused();
    await page.keyboard.press("Tab");
    await test.expect(field).toBeFocused();
    await q.radio("Social media").click();
    await test.expect(field).toHaveCount(0);
  });

  test("keeps the typed text when Other is checked again", async ({ q }) => {
    await q.radio("Other").click();
    await q.textbox("Where did you hear about us?").fill("Podcast");
    await q.radio("Social media").click();
    await q.radio("Other").click();
    await test
      .expect(q.textbox("Where did you hear about us?"))
      .toHaveValue("Podcast");
  });

  test("keeps the field out of the radio group", async ({ q }) => {
    await q.radio("Other").click();
    await test.expect(q.textbox("Where did you hear about us?")).toBeVisible();
    const group = query(q.radiogroup("How did you hear about us?"));
    await test
      .expect(group.textbox("Where did you hear about us?"))
      .toHaveCount(0);
  });
});

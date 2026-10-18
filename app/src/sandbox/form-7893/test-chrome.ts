import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  // https://github.com/ariakit/ariakit/issues/7893
  test("validating stays true while a newer validation is pending", async ({
    page,
    q,
  }) => {
    const form = query(q.form("Add user"));
    await form.textbox("Username").pressSequentially("ada");
    await test.expect(form.text(/Username check: pending/)).toBeVisible();
    // Each cancelled check settles its validate() call one frame later, so
    // cross that frame before asserting the flag that must stay set.
    await flushFrames(page);
    await test.expect(form.text(/Validating: yes/)).toBeVisible();
    await test.expect(form.button("Add")).toBeDisabled();

    await form.button("Finish username check").click();
    await test.expect(form.text("Username is taken")).toBeVisible();
    await test.expect(form.text(/Validating: no/)).toBeVisible();
    await test.expect(form.button("Add")).toBeDisabled();
  });

  // https://github.com/ariakit/ariakit/issues/7893
  test("submitting stays true while a newer submission is pending", async ({
    page,
    q,
  }) => {
    const form = query(q.form("Edit draft"));
    await form.textbox("Draft").click();
    await page.keyboard.press("Enter");
    await page.keyboard.press("Tab");
    await test.expect(form.text(/Pending saves: 2/)).toBeVisible();
    await test.expect(form.text(/Submitting: yes/)).toBeVisible();

    await form.button("Finish oldest save").click();
    await test.expect(form.text(/Completed: 1/)).toBeVisible();
    // The first submit() call settles one frame after its callback completes,
    // so cross that frame before asserting the flag that must stay set.
    await flushFrames(page);
    await test.expect(form.text(/Pending saves: 1/)).toBeVisible();
    await test.expect(form.text(/Submitting: yes/)).toBeVisible();
    await test.expect(form.button("Save draft")).toBeDisabled();

    await form.button("Finish oldest save").click();
    await test.expect(form.text(/Completed: 2/)).toBeVisible();
    await test.expect(form.text(/Submitting: no/)).toBeVisible();
    await test.expect(form.button("Save draft")).toBeEnabled();
  });
});

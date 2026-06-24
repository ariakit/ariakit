import { withFramework } from "#app/test-utils/preview.ts";

// Reproduces https://github.com/ariakit/ariakit/issues/6307
withFramework(import.meta.dirname, async ({ test }) => {
  test("a successful submit does not steal focus on later items changes", async ({
    page,
    q,
  }) => {
    const email = q.textbox("Email");
    const addNickname = q.button("Add nickname");

    // 1. Submit with the email empty: the submission fails and the invalid email
    //    field is focused (correct autoFocusOnSubmit behavior).
    await q.button("Save").click();
    await test.expect(email).toBeFocused();
    await test.expect(email).toHaveAttribute("aria-invalid", "true");

    // 2. Type a valid value, wait for it to be accepted, then submit again. Wait
    //    for the successful submission to fully settle (with resetOnSubmit={false}
    //    the form keeps its values) before touching the form again.
    await email.fill("jane");
    await test.expect(email).toHaveAttribute("aria-invalid", "false");
    await q.button("Save").click();
    await test.expect(q.status()).toHaveText("Successful submissions: 1");

    // 3. Make the email invalid again without submitting.
    await email.clear();
    await test.expect(email).toHaveAttribute("aria-invalid", "true");

    // 4. Move focus to the button. This blurs the email and re-runs validation,
    //    so wait for the field to settle back to invalid before activating it.
    await addNickname.focus();
    await test.expect(email).toHaveAttribute("aria-invalid", "true");

    // 5. Activate the button, mounting the optional nickname field and changing
    //    the form items.
    await page.keyboard.press("Enter");
    await test.expect(q.textbox("Nickname")).toBeVisible();

    // The buggy focus steal runs in an effect after the items change, so wait for
    // it to settle and assert the final focus rather than a pre-steal transient.
    await page.waitForTimeout(250);

    // Focus must stay on the button and must not be stolen by the invalid email.
    await test.expect(addNickname).toBeFocused();
    await test.expect(email).not.toBeFocused();
  });
});

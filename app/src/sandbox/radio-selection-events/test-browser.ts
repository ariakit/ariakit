import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("does not change a native radio when focus returns to it", async ({
    page,
    q,
  }) => {
    await q.radio("Native apple").click();
    await test.expect(q.status("Native change count")).toHaveText("1");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await test.expect(q.status("Native change count")).toHaveText("3");
    await page.keyboard.press("Tab");
    await page.keyboard.press("Shift+Tab");
    await test.expect(q.status("Native change count")).toHaveText("3");
  });

  test("does not change an already checked custom radio", async ({ q }) => {
    await q.radio("Custom apple").click();
    await test.expect(q.status("Custom change count")).toHaveText("1");
    await q.radio("Custom apple").click();
    await test.expect(q.status("Custom change count")).toHaveText("1");
  });

  // https://github.com/ariakit/ariakit/issues/7898
  test("selects a radio by click after the owner resets checked", async ({
    q,
  }) => {
    await q.radio("SMS").click();
    await test.expect(q.radio("SMS")).toBeChecked();
    await q.button("Restore defaults").click();
    await test.expect(q.radio("Email")).toBeChecked();
    await q.radio("SMS").click();
    await test.expect(q.radio("SMS")).toBeChecked();
    await q.button("Save preferences").click();
    await test.expect(q.status("Saved channel")).toHaveText("sms");
  });

  // https://github.com/ariakit/ariakit/issues/7898
  test("selects a radio by arrow key after the owner resets checked", async ({
    page,
    q,
  }) => {
    await q.radio("SMS").click();
    await test.expect(q.radio("SMS")).toBeChecked();
    await q.button("Restore defaults").click();
    await test.expect(q.radio("Email")).toBeChecked();
    // Clicking Email would select it and resync the store, which hides the bug,
    // so move focus to it without selecting it.
    await q.radio("Email").focus();
    await test.expect(q.radio("Email")).toBeFocused();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.radio("SMS")).toBeFocused();
    await test.expect(q.radio("SMS")).toBeChecked();
    await q.button("Save preferences").click();
    await test.expect(q.status("Saved channel")).toHaveText("sms");
  });

  // https://github.com/ariakit/ariakit/issues/7898
  test("selects a custom radio after the owner resets checked", async ({
    q,
  }) => {
    await q.radio("Controlled orange").click();
    await test.expect(q.status("Controlled change count")).toHaveText("1");
    await q.button("Reset controlled radios").click();
    await test.expect(q.radio("Controlled apple")).toBeChecked();
    await q.radio("Controlled orange").click();
    await test.expect(q.radio("Controlled orange")).toBeChecked();
    await test.expect(q.status("Controlled change count")).toHaveText("2");
  });

  // https://github.com/ariakit/ariakit/issues/7898
  test("does not change an already checked controlled custom radio", async ({
    q,
  }) => {
    await q.radio("Controlled orange").click();
    await test.expect(q.status("Controlled change count")).toHaveText("1");
    await q.radio("Controlled orange").click();
    await test.expect(q.radio("Controlled orange")).toBeChecked();
    await test.expect(q.status("Controlled change count")).toHaveText("1");
  });
});

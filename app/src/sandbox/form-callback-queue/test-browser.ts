import { withFramework } from "#app/test-utils/preview.ts";

const validationSuffix = " - Field 1 - Field 2 - Abstract Form - Form";
const submitError =
  "Field - Abstract Form 1 - Abstract Form 2 - Form 1 - Form 2";

withFramework(import.meta.dirname, async ({ test }) => {
  test("runs validation callbacks for synchronous fields", async ({ q }) => {
    const validationError = q.alert().filter({ hasText: validationSuffix });
    await q.textbox("Name").click();
    await test.expect(validationError).not.toBeVisible();
    await q.textbox("Email").click();
    await test
      .expect(validationError)
      .toHaveText(new RegExp(`${validationSuffix}$`));
  });

  test("runs validation callbacks for fields mounted asynchronously", async ({
    page,
    q,
  }) => {
    const validationError = q.alert().filter({ hasText: validationSuffix });
    await q.textbox("Email").click();
    await test.expect(validationError).not.toBeVisible();
    await page.mouse.click(0, 0);
    await test
      .expect(validationError)
      .toHaveText(new RegExp(`${validationSuffix}$`));
  });

  test("runs every submit callback in registration order", async ({ q }) => {
    await q.textbox("Name").fill("a");
    await q.textbox("Email").fill("a");
    await q.button("Submit").click();
    await test.expect(q.text(submitError)).toHaveCount(2);
  });
});

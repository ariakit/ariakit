import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("button shows pending state when submitted with Enter", async ({
    page,
    q,
  }) => {
    const form = query(q.form("AriakitButton"));
    const button = form.button();

    await button.focus();
    await page.keyboard.press("Enter");

    await test.expect(button).toHaveText("Pending");
  });

  test("rendered submit button shows pending state", async ({ page, q }) => {
    const form = query(q.form("AriakitButton rendered submit"));
    const button = form.button();

    await button.focus();
    await page.keyboard.press("Enter");

    await test.expect(button).toHaveText("Pending");
  });

  test("focusable button keeps pending state after losing focus", async ({
    page,
    q,
  }) => {
    const form = query(q.form("AriakitButton focusable"));
    const button = form.button();

    await button.focus();
    await page.keyboard.press("Enter");
    await test.expect(button).toHaveText("Pending");

    await page.keyboard.press("Tab");

    await test.expect(button).toHaveText("Pending");
  });

  test("focusable button prevents activation while pending", async ({
    page,
    q,
  }) => {
    const form = query(q.form("AriakitButton focusable"));
    const button = form.button();

    await button.focus();
    await page.keyboard.press("Enter");
    await test.expect(button).toHaveText("Pending");
    await test.expect(button).toHaveAttribute("data-click-count", "1");

    await page.keyboard.press("Enter");

    await test.expect(button).toHaveAttribute("data-click-count", "1");
  });

  test("focusable native button prevents activation while pending", async ({
    page,
    q,
  }) => {
    const form = query(q.form("NativeButton focusable"));
    const button = form.button();

    await button.focus();
    await page.keyboard.press("Enter");
    await test.expect(button).toHaveText("Pending");
    await test.expect(button).toHaveAttribute("data-click-count", "1");

    await page.keyboard.press("Enter");

    await test.expect(button).toHaveAttribute("data-click-count", "1");
  });
});

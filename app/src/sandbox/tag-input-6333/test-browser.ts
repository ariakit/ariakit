import { withFramework } from "#app/test-utils/preview.ts";

// Reproduces https://github.com/ariakit/ariakit/issues/6333
withFramework(import.meta.dirname, async ({ test }) => {
  test("splits string delimiters with regex metacharacters literally", async ({
    page,
    q,
  }) => {
    await q.textbox("Dot tags").click();
    await page.keyboard.type("one.two.");
    await test.expect(q.text("Dot tags values: one, two")).toBeVisible();
  });

  test("does not throw on string delimiters that are invalid regex patterns", async ({
    page,
    q,
  }) => {
    await q.textbox("Plus tags").click();
    await page.keyboard.type("one+two+");
    await test.expect(q.text("Plus tags values: one, two")).toBeVisible();
  });
});

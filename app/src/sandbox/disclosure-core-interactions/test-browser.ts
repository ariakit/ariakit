import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("toggles disclosure with click, Enter, and Space", async ({
    page,
    q,
  }) => {
    const disclosure = q.button("What are vegetables?");
    const content = q.text("Vegetables are parts of plants.");

    await test.expect(content).not.toBeVisible();
    await test.expect(disclosure).toHaveAttribute("aria-expanded", "false");

    await disclosure.click();
    await test.expect(content).toBeVisible();
    await test.expect(disclosure).toHaveAttribute("aria-expanded", "true");

    await disclosure.press("Enter");
    await test.expect(content).not.toBeVisible();
    await disclosure.press("Enter");
    await test.expect(content).toBeVisible();

    await page.keyboard.press("Space");
    await test.expect(content).not.toBeVisible();
    await page.keyboard.press("Space");
    await test.expect(content).toBeVisible();
  });
});

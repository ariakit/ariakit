import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("names the scroll area and the copy button with the title", async ({
    context,
    page,
    q,
  }) => {
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await test
      .expect(q.region("format-price.ts"))
      .toHaveAttribute("tabindex", "0");
    // The block has no label for the button, so it takes it from the title.
    await q.button("Copy format-price.ts").click();
    await test.expect(q.button("Copied")).toBeVisible();
    const copied = await page.evaluate(() => navigator.clipboard.readText());
    test.expect(copied).toMatch(/^export function formatPrice\(/);
  });
});

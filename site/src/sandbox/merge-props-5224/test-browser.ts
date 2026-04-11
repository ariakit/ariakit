import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("mergeProps should not stringify falsy className values", async ({
    page,
  }) => {
    const result1 = await page.locator('[data-testid="result1"]').textContent();
    const result2 = await page.locator('[data-testid="result2"]').textContent();
    const result3 = await page.locator('[data-testid="result3"]').textContent();

    // When className override is null, should preserve base class
    test.expect(result1).not.toContain("null");
    test.expect(result1).toContain("base-class");

    // When className override is undefined, should preserve base class
    test.expect(result2).not.toContain("undefined");
    test.expect(result2).toContain("base-class");

    // When className override is empty string, should preserve base class
    test.expect(result3).toContain("base-class");
  });

  test("mergeProps should not overwrite handlers with falsy values", async ({
    page,
  }) => {
    const result4 = await page.locator('[data-testid="result4"]').textContent();
    const result5 = await page.locator('[data-testid="result5"]').textContent();

    // When onClick override is null, should preserve base handler
    test.expect(result4).toContain("yes");

    // When onClick override is undefined, should preserve base handler
    test.expect(result5).toContain("yes");
  });
});

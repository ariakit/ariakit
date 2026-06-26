import { withFramework } from "#app/test-utils/preview.ts";

// https://github.com/ariakit/ariakit/issues/6337
withFramework(import.meta.dirname, async ({ test }) => {
  test("measured and fixed renderers agree on offsets and total height", async ({
    page,
    q,
  }) => {
    // Expected values follow the fixed-size formula:
    // paddingStart + itemSize * index + gap * index.
    await test.expect(q.button("Measured 1")).toHaveCSS("top", "20px");
    await test.expect(q.button("Measured 2")).toHaveCSS("top", "62px");
    await test.expect(q.button("Fixed 1")).toHaveCSS("top", "20px");
    await test.expect(q.button("Fixed 2")).toHaveCSS("top", "62px");

    await test
      .expect(page.locator("#measured-renderer"))
      .toHaveCSS("height", "366px");
    await test
      .expect(page.locator("#fixed-renderer"))
      .toHaveCSS("height", "366px");
  });
});

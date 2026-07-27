import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("renders a horizontal separator", async ({ q }) => {
    const separator = q.separator();
    await test.expect(separator).toHaveJSProperty("tagName", "HR");
    await test.expect(separator).toHaveAttribute("role", "separator");
    await test
      .expect(separator)
      .toHaveAttribute("aria-orientation", "horizontal");
  });
});

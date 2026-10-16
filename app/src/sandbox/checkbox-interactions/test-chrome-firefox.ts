import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7036
  test("preserves checkbox semantics when an optional render prop is undefined", async ({
    q,
  }) => {
    const checkbox = q.checkbox("Forwarded undefined");
    await test.expect(checkbox).toHaveAttribute("aria-checked", "false");

    await checkbox.click();
    await test
      .expect(q.checkbox("Forwarded undefined"))
      .toHaveAttribute("aria-checked", "true");
  });
});

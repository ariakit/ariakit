import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/6302
  test("honors explicit toolbar separator orientation", async ({ q }) => {
    await test
      .expect(q.separator("Row divider"))
      .toHaveAttribute("aria-orientation", "horizontal");

    await test
      .expect(q.separator("Plain divider"))
      .toHaveAttribute("aria-orientation", "vertical");
  });
});

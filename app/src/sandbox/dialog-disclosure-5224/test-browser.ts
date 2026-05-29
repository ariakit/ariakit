import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("dialog opens when render prop has onClick={undefined}", async ({
    q,
  }) => {
    // When DialogDisclosure uses render={<Button onClick={undefined}>},
    // mergeProps should preserve the internal onClick handler instead of
    // overwriting it with undefined.
    // See https://github.com/ariakit/ariakit/issues/5224
    await q.button("Open dialog").click();
    await test.expect(q.dialog()).toBeVisible();
  });

  test("className does not include falsy values from render prop", async ({
    q,
  }) => {
    // When Button has className="base" and render={<a className={undefined}>},
    // mergeProps should produce "base" instead of "base undefined".
    // See https://github.com/ariakit/ariakit/issues/5224
    const el = q.text("Check className");
    await test.expect(el).toHaveAttribute("class", "base");
  });
});

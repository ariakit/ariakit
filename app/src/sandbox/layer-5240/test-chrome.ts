import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974019400
  test("renders numeric zero with the same hue as string zero", async ({
    q,
  }) => {
    const numeric = q.text("Numeric zero");
    const reference = q.text("String zero");
    const other = q.text("120 degrees");
    const zeroColor = await reference.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    );
    await test.expect(numeric).toHaveCSS("background-color", zeroColor);
    await test.expect(other).not.toHaveCSS("background-color", zeroColor);
  });
});

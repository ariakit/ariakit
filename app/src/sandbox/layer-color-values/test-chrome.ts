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

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974543567
  test("renders zero chroma and maximum lightness", async ({ q }) => {
    for (const [numeric, reference] of [
      ["Zero chroma", "String zero chroma"],
      ["Zero maximum lightness", "String zero maximum lightness"],
    ] as const) {
      const zeroColor = await q
        .text(reference)
        .evaluate((element) => getComputedStyle(element).backgroundColor);
      await test
        .expect(q.text(numeric))
        .toHaveCSS("background-color", zeroColor);
      await test
        .expect(q.text("Unmodified layer"))
        .not.toHaveCSS("background-color", zeroColor);
    }
    const baseColor = await q
      .text("Unmodified layer")
      .evaluate((element) => getComputedStyle(element).backgroundColor);
    await test
      .expect(q.text("Empty chroma"))
      .toHaveCSS("background-color", baseColor);
  });

  // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974545415
  test("renders numeric zero text and edge hues", async ({ q }) => {
    for (const [kind, property] of [
      ["text", "color"],
      ["edge", "border-top-color"],
    ] as const) {
      const zeroColor = await q
        .text(`String ${kind} hue`)
        .evaluate(
          (element, property) =>
            getComputedStyle(element).getPropertyValue(property),
          property,
        );
      await test
        .expect(q.text(`Numeric ${kind} hue`))
        .toHaveCSS(property, zeroColor);
      await test
        .expect(q.text(`Other ${kind} hue`))
        .not.toHaveCSS(property, zeroColor);
    }
  });
});

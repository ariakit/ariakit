import { withFramework } from "#app/test-utils/preview.ts";

withFramework(
  import.meta.dirname,
  { route: "layer-fixtures" },
  async ({ test, query }) => {
    // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974019400
    test("renders numeric zero with the same hue as string zero", async ({
      q,
    }) => {
      const fixture = query(q.article("Layer color values"));
      const numeric = fixture.text("Numeric zero");
      const reference = fixture.text("String zero");
      const other = fixture.text("120 degrees");
      const zeroColor = await reference.evaluate(
        (element) => getComputedStyle(element).backgroundColor,
      );
      await test.expect(numeric).toHaveCSS("background-color", zeroColor);
      await test.expect(other).not.toHaveCSS("background-color", zeroColor);
    });

    // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974543567
    test("renders zero chroma and maximum lightness", async ({ q }) => {
      const fixture = query(q.article("Layer color values"));
      for (const [numeric, reference] of [
        ["Zero chroma", "String zero chroma"],
        ["Zero maximum lightness", "String zero maximum lightness"],
      ] as const) {
        const zeroColor = await fixture
          .text(reference)
          .evaluate((element) => getComputedStyle(element).backgroundColor);
        await test
          .expect(fixture.text(numeric))
          .toHaveCSS("background-color", zeroColor);
        await test
          .expect(fixture.text("Unmodified layer"))
          .not.toHaveCSS("background-color", zeroColor);
      }
      const baseColor = await fixture
        .text("Unmodified layer")
        .evaluate((element) => getComputedStyle(element).backgroundColor);
      await test
        .expect(fixture.text("Empty chroma"))
        .toHaveCSS("background-color", baseColor);
    });

    // https://github.com/ariakit/ariakit/pull/5240#discussion_r3974545415
    test("renders numeric zero text and edge hues", async ({ q }) => {
      const fixture = query(q.article("Layer color values"));
      for (const [kind, property] of [
        ["text", "color"],
        ["edge", "border-top-color"],
      ] as const) {
        const zeroColor = await fixture
          .text(`String ${kind} hue`)
          .evaluate(
            (element, property) =>
              getComputedStyle(element).getPropertyValue(property),
            property,
          );
        await test
          .expect(fixture.text(`Numeric ${kind} hue`))
          .toHaveCSS(property, zeroColor);
        await test
          .expect(fixture.text(`Other ${kind} hue`))
          .not.toHaveCSS(property, zeroColor);
      }
    });
  },
);

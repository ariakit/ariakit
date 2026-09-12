import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  for (const colorScheme of ["light", "dark"] as const) {
    for (const contrast of ["no-preference", "more"] as const) {
      test.describe(`${colorScheme} ${contrast}`, () => {
        test.use({ colorScheme, contrast });

        // https://github.com/ariakit/ariakit/issues/7474
        test("matches native disabled colors through the utility and its descendants", async ({
          q,
        }) => {
          const native = q.button(
            "Native disabled Native badge Native colored text",
          );
          const label = q
            .text("Disabled upload", { exact: false })
            .filter({ has: q.text("Upload badge") });
          await test.expect(label).not.toHaveAttribute("disabled");
          await test.expect(label).not.toHaveAttribute("aria-disabled");
          for (const property of [
            "color",
            "background-color",
            "border-top-color",
          ]) {
            const expected = await native.evaluate(
              (element, property) =>
                getComputedStyle(element).getPropertyValue(property),
              property,
            );
            for (const element of [
              label,
              q.button("ARIA disabled"),
              q.button("Both disabled paths"),
            ]) {
              await test.expect(element).toHaveCSS(property, expected);
            }
          }
          for (const name of ["badge", "colored text"]) {
            const color = await q
              .text(`Native ${name}`)
              .evaluate((element) => getComputedStyle(element).color);
            await test
              .expect(q.text(`Upload ${name}`))
              .toHaveCSS("color", color);
          }
          const enabledColor = await q
            .button("Enabled")
            .evaluate((element) => getComputedStyle(element).color);
          await test.expect(native).not.toHaveCSS("color", enabledColor);
        });
      });
    }
  }
});

import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

function getBackground(card: Locator) {
  return card.evaluate((node) => getComputedStyle(node).backgroundColor);
}

withFramework(
  import.meta.dirname,
  { route: "checkbox" },
  async ({ test, query }) => {
    test("a checked card stands apart on a brand layer", async ({ q }) => {
      const box = query(q.article("Cards on a brand layer"));
      // The card is the label around the hidden input.
      const checked = box.checkbox(/^Exports/).locator("xpath=..");
      const unchecked = box.checkbox(/^API access/).locator("xpath=..");
      // Mixing brand into a brand surface gives the surface color back, so only
      // a tint that moves away from the surface tells the cards apart.
      test
        .expect(await getBackground(checked))
        .not.toBe(await getBackground(unchecked));
    });

    test("an empty box keeps a visible edge", async ({ q }) => {
      const enabled = query(q.article("Checkbox field")).checkbox(
        "Remember me",
      );
      const disabled = query(q.article("Disabled field")).checkbox(
        /^Beta program/,
      );
      // An empty box has no other boundary, so its edge weight is the lightest
      // that reaches 3:1 on a light or a dark canvas. A disabled box stays
      // dimmer but must not vanish.
      await test.expect(enabled).toHaveCSS("border-top-color", /\/ 0\.45\)$/);
      await test.expect(disabled).toHaveCSS("border-top-color", /\/ 0\.2\)$/);
    });
  },
);

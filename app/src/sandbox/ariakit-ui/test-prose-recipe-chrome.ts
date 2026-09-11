import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

function getColor(locator: Locator) {
  return locator.evaluate((node) => getComputedStyle(node).color);
}

withFramework(
  import.meta.dirname,
  { route: "prose" },
  async ({ query, test }) => {
    test("lets a text-* class set the size of the whole column", async ({
      q,
    }) => {
      const box = query(q.article("Large type"));
      const prose = box.heading("Larger text").locator("xpath=..");
      // text-2xl sorts before the recipe's base size, which used to win on
      // equal specificity and keep the column at 16px.
      await test.expect(prose).toHaveCSS("font-size", "24px");
      await test.expect(prose).toHaveCSS("line-height", "39px");
      // The rhythm is in em, so it grows with the column.
      await test.expect(prose).toHaveCSS("row-gap", "30px");
    });

    test("keeps list items in a nested layer on the paragraph tone", async ({
      q,
    }) => {
      const box = query(q.article("Callout on an inverted layer"));
      const paragraph = box.text(/^A callout is a surface of its own/);
      const [first, second] = await box.listitem().all();
      if (!first || !second) {
        throw new Error("The callout must render two list items");
      }
      const paragraphColor = await getColor(paragraph);
      // List items used to take the full ink of the callout layer while the
      // paragraph next to them kept the muted body tone.
      test.expect(await getColor(first)).toBe(paragraphColor);
      test.expect(await getColor(second)).toBe(paragraphColor);
    });
  },
);

import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

function getRect(locator: Locator) {
  return locator.evaluate((node) => {
    const { top, bottom } = node.getBoundingClientRect();
    return { top, bottom };
  });
}

function getColor(locator: Locator) {
  return locator.evaluate((node) => getComputedStyle(node).color);
}

withFramework(
  import.meta.dirname,
  { route: "heading" },
  async ({ query, test }) => {
    test("nests the semantic ladder under the box title", async ({ q }) => {
      const box = query(q.article("Semantic levels"));
      await test
        .expect(box.heading("Level three", { level: 3 }))
        .toHaveCSS("font-size", "22.4px");
      await test
        .expect(box.heading("Level four", { level: 4 }))
        .toHaveCSS("font-size", "19.2px");
      await test
        .expect(box.heading("Level five", { level: 5 }))
        .toHaveCSS("font-size", "16px");
      await test
        .expect(box.heading("Level six", { level: 6 }))
        .toHaveCSS("font-size", "16px");
    });

    test("sizes a heading as another step without changing its element", async ({
      q,
    }) => {
      const heading = query(q.article("Visual level")).heading(
        "An h4 at the h2 size",
        { level: 4 },
      );
      await test.expect(heading).toHaveCSS("font-size", "28px");
    });

    test("lets a text-* class replace the size step of the element", async ({
      q,
    }) => {
      const heading = query(q.article("Size override")).heading(
        "A small section title",
        { level: 3 },
      );
      // The element rule used to outrank text-sm and keep 22.4px, while the
      // line height of text-sm still applied.
      await test.expect(heading).toHaveCSS("font-size", "14px");
      await test.expect(heading).toHaveCSS("line-height", "20px");
    });

    test("puts a heading closer to a heading above it than to a paragraph", async ({
      q,
    }) => {
      const box = query(q.article("Flow margins"));
      const first = await getRect(box.heading("First heading"));
      const under = await getRect(box.heading("A heading right under it"));
      const paragraph = await getRect(
        box.text("A paragraph of running text between the headings."),
      );
      const after = await getRect(box.heading("A heading after a paragraph"));
      const headingToHeading = under.top - first.bottom;
      const paragraphToHeading = after.top - paragraph.bottom;
      // In a flex column margins do not collapse, so the upper heading's own
      // bottom margin used to add up with the gap and the follower's margin,
      // and both distances came out almost the same.
      test.expect(headingToHeading).toBeLessThan(paragraphToHeading - 10);
    });

    test("keeps even padding around the only heading in a layer", async ({
      q,
    }) => {
      const heading = query(q.article("On an inverted layer")).heading(
        "Inverted heading",
      );
      const layer = heading.locator("xpath=..");
      const headingRect = await getRect(heading);
      const layerRect = await getRect(layer);
      const topInset = headingRect.top - layerRect.top;
      const bottomInset = layerRect.bottom - headingRect.bottom;
      // A last child used to keep its bottom margin inside the padding.
      test.expect(Math.abs(bottomInset - topInset)).toBeLessThan(0.5);
    });

    test("underlines a permalink only on hover", async ({ q }) => {
      const heading = query(q.article("Permalink")).heading("Anchored heading");
      const link = query(heading).link("Anchored heading");
      await test.expect(link).toHaveCSS("text-decoration-line", "none");
      test.expect(await getColor(link)).toBe(await getColor(heading));
      await link.hover();
      await test.expect(link).toHaveCSS("text-decoration-line", "underline");
      await test.expect(link).toHaveCSS("text-decoration-thickness", "1px");
    });
  },
);

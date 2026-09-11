import { withFramework } from "#app/test-utils/preview.ts";

// Each engine breaks a long token differently: Chrome and Safari kept it on one
// line past the column, and Firefox broke it at the slashes without padding or
// a ring on the middle fragment. So this runs in every desktop project.
withFramework(
  import.meta.dirname,
  { route: "code" },
  async ({ query, test }) => {
    test("wraps a long token inside a narrow column", async ({ q }) => {
      const chip = query(q.article("Long content")).text(
        "@ariakit/ui/components/disclosure.ariakit.react",
      );
      const layout = await chip.evaluate((node) => {
        const paragraph = node.parentElement;
        if (!paragraph) throw new Error("The chip has no parent paragraph");
        const style = getComputedStyle(node);
        return {
          fragments: node.getClientRects().length,
          overflow: paragraph.scrollWidth - paragraph.clientWidth,
          // Safari only reports the prefixed property.
          decoration:
            style.boxDecorationBreak ||
            style.getPropertyValue("-webkit-box-decoration-break"),
        };
      });
      test.expect(layout.overflow).toBeLessThanOrEqual(0);
      test.expect(layout.fragments).toBeGreaterThanOrEqual(2);
      // Every fragment keeps its own padding, radius and ring.
      test.expect(layout.decoration).toBe("clone");
    });
  },
);

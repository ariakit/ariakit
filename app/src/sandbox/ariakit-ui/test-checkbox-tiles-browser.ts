import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

/**
 * Measures every tile card around the given inputs. A tile holds, after its
 * hidden input, the slot, the content wrapper (label first) and the check, in
 * source order.
 */
function measureTiles(inputs: Locator) {
  return inputs.evaluateAll((nodes) =>
    nodes.map((input) => {
      const card = input.closest("label");
      const [slot, content, check] = Array.from(card?.children ?? []).filter(
        (child) => child !== input,
      );
      const label = content?.firstElementChild;
      if (!card || !slot || !content || !check || !label) {
        throw new Error("A tile card is missing one of its parts");
      }
      const edges = (element: Element) => {
        const { top, right, bottom, left } = element.getBoundingClientRect();
        return { top, right, bottom, left };
      };
      return {
        card: edges(card),
        slot: edges(slot),
        content: edges(content),
        label: edges(label),
        check: edges(check),
      };
    }),
  );
}

withFramework(
  import.meta.dirname,
  { route: "checkbox" },
  async ({ test, query }) => {
    test("a tile lays its parts out in two rows", async ({ q }) => {
      const tiles = await measureTiles(
        query(q.article("Stacked tiles")).checkbox(),
      );
      test.expect(tiles).toHaveLength(4);
      for (const { card, slot, content, label, check } of tiles) {
        const slotInset = slot.left - card.left;
        // The slot drops the margins that seat it on a line of text, so it
        // starts at the card's padding, where the label below it starts.
        test.expect(slotInset).toBeGreaterThan(0);
        test.expect(label.left - card.left).toBeCloseTo(slotInset, 1);
        // The content takes a row of its own under the slot and the check.
        test.expect(content.top).toBeGreaterThanOrEqual(slot.bottom);
        test.expect(content.top).toBeGreaterThanOrEqual(check.bottom);
        test
          .expect(content.right - content.left)
          .toBeCloseTo(card.right - card.left - slotInset * 2, 1);
        // The check ends the top row, as far from the end as the slot is from
        // the start.
        test.expect(check.top).toBeCloseTo(slot.top, 1);
        test.expect(card.right - check.right).toBeCloseTo(slotInset, 1);
      }
    });
  },
);

withFramework(
  import.meta.dirname,
  { route: "checkbox-fixtures" },
  async ({ test, query }) => {
    test("a right-to-left tile mirrors its parts", async ({ q }) => {
      const [tile] = await measureTiles(
        query(q.article("Right to left tile")).checkbox(),
      );
      test.expect(tile).toBeDefined();
      if (!tile) return;
      const { card, slot, content, label, check } = tile;
      const slotInset = card.right - slot.right;
      test.expect(slotInset).toBeGreaterThan(0);
      test.expect(card.right - label.right).toBeCloseTo(slotInset, 1);
      test.expect(content.top).toBeGreaterThanOrEqual(slot.bottom);
      test.expect(check.top).toBeCloseTo(slot.top, 1);
      test.expect(check.left - card.left).toBeCloseTo(slotInset, 1);
    });

    test("a badge inside a tile keeps its own slot margins", async ({ q }) => {
      const example = query(q.article("Tile with a badge"));
      const measureBadges = (text: string) =>
        example.text(text).evaluateAll((labels) =>
          labels.map((label) => {
            const badge = label.parentElement;
            const slot = label.previousElementSibling;
            if (!badge || !slot) {
              throw new Error("A badge is missing its slot");
            }
            const slotStyle = getComputedStyle(slot);
            return {
              badgeMarginInlineStart: Number.parseFloat(
                getComputedStyle(badge).marginInlineStart,
              ),
              marginInlineStart: Number.parseFloat(slotStyle.marginInlineStart),
              marginTop: Number.parseFloat(slotStyle.marginTop),
            };
          }),
        );
      // The first "Recommended" badge sits in a tile's content, the second
      // after the tiles. "Popular" is a part of the other tile, beside its
      // slot.
      const recommended = await measureBadges("Recommended");
      const popular = await measureBadges("Popular");
      const [inContent, outside] = recommended;
      const [asPart] = popular;
      test.expect(recommended).toHaveLength(2);
      test.expect(popular).toHaveLength(1);
      if (!inContent || !outside || !asPart) return;
      test.expect(outside.marginInlineStart).not.toBe(0);
      for (const badge of [inContent, asPart]) {
        test
          .expect(badge.marginInlineStart)
          .toBeCloseTo(outside.marginInlineStart, 2);
        test.expect(badge.marginTop).toBeCloseTo(outside.marginTop, 2);
      }
      // A tile drops the in-row margin its slot gives the next part, and a
      // badge placed there is spaced like any other part.
      test.expect(asPart.badgeMarginInlineStart).toBeCloseTo(0, 2);
    });
  },
);

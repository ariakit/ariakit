import { withFramework } from "#app/test-utils/preview.ts";

withFramework(
  import.meta.dirname,
  { route: "radio" },
  async ({ test, query }) => {
    test("a radio tile lays its parts out in two rows", async ({ q }) => {
      const radios = query(q.article("Stacked tiles")).radio();
      // A tile holds, after its hidden input, the slot, the content wrapper
      // (label first) and the check, in source order.
      const tiles = await radios.evaluateAll((nodes) =>
        nodes.map((input) => {
          const card = input.closest("label");
          const [slot, content, check] = Array.from(
            card?.children ?? [],
          ).filter((child) => child !== input);
          const label = content?.firstElementChild;
          if (!card || !slot || !content || !check || !label) {
            throw new Error("A tile card is missing one of its parts");
          }
          const edges = (element: Element) => {
            const { top, right, bottom, left } =
              element.getBoundingClientRect();
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
      test.expect(tiles).toHaveLength(3);
      for (const { card, slot, content, label, check } of tiles) {
        const slotInset = slot.left - card.left;
        // The radio card shares the checkbox card's tile mode: the slot starts
        // where the label below it starts, and the round check ends the top
        // row.
        test.expect(slotInset).toBeGreaterThan(0);
        test.expect(label.left - card.left).toBeCloseTo(slotInset, 1);
        test.expect(content.top).toBeGreaterThanOrEqual(slot.bottom);
        test.expect(content.top).toBeGreaterThanOrEqual(check.bottom);
        test.expect(check.top).toBeCloseTo(slot.top, 1);
        test.expect(card.right - check.right).toBeCloseTo(slotInset, 1);
      }
    });
  },
);

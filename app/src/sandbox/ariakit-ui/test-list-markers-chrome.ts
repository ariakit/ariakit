import { withFramework } from "#app/test-utils/preview.ts";

withFramework(
  import.meta.dirname,
  { route: "list" },
  async ({ test, query }) => {
    test("describes the value of a progress marker", async ({ q }) => {
      const row = query(q.article("Checklist"))
        .listitem()
        .filter({ hasText: "Collect the replies" });
      const marker = query(row).img("Unchecked");
      await test.expect(marker).toHaveAccessibleDescription("65% complete");

      const done = query(q.article("Checklist"))
        .listitem()
        .filter({ hasText: "Book the venue" });
      await test
        .expect(query(done).img("Checked"))
        .toHaveAccessibleDescription("");
    });

    // A marker outside a list used to read its arc thickness only from list
    // rules, so it painted a filled pie, and it took its offset from the
    // padding of any frame around it, so it left the box that holds it.
    test("draws a standalone progress marker as an arc in its box", async ({
      q,
    }) => {
      const entry = query(q.article("Status legend")).text("In progress");
      const marker = query(entry).img("Unchecked");
      await test.expect(marker).toHaveAccessibleDescription("70% complete");

      const arc = marker.locator(":scope > span");
      await test.expect(arc).toHaveCSS("mask-image", /^radial-gradient\(/);

      const placement = await marker.evaluate((node) => {
        const box = node.parentElement?.getBoundingClientRect();
        const rect = node.getBoundingClientRect();
        if (!box) return null;
        return {
          start: rect.left - box.left,
          top: rect.top - box.top,
          end: box.right - rect.right,
          bottom: box.bottom - rect.bottom,
        };
      });
      test.expect(placement).not.toBeNull();
      if (!placement) return;
      // The marker is inset equally on every side of its one-line box.
      test.expect(placement.start).toBeGreaterThan(0);
      test.expect(placement.top).toBeCloseTo(placement.start, 1);
      test.expect(placement.end).toBeCloseTo(placement.start, 1);
      test.expect(placement.bottom).toBeCloseTo(placement.start, 1);
    });
  },
);

import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

// Whether the element itself, not something painted over it, is what the
// pointer reaches at its center. Hit testing only covers the viewport.
async function isHitAtCenter(element: Locator) {
  await element.scrollIntoViewIfNeeded();
  return element.evaluate((node) => {
    const rect = node.getBoundingClientRect();
    const hit = node.ownerDocument.elementFromPoint(
      rect.x + rect.width / 2,
      rect.y + rect.height / 2,
    );
    return !!hit && node.contains(hit);
  });
}

withFramework(
  import.meta.dirname,
  { route: "progress" },
  async ({ test, query }) => {
    // The disc that paints the parent surface back over the center of the ring
    // used to paint over the label too, and the arc's box, whose mask hit
    // testing ignores, took the pointer.
    test("shows the label in the middle of the ring", async ({ q }) => {
      const ring = query(q.article("Ring with label")).progressbar(
        "Photo backup",
      );
      const label = query(ring).text("70%");
      await test.expect(label).toBeVisible();
      test.expect(await isHitAtCenter(label)).toBe(true);

      const ringBox = await ring.boundingBox();
      const labelBox = await label.boundingBox();
      test.expect(ringBox).not.toBeNull();
      test.expect(labelBox).not.toBeNull();
      if (!ringBox || !labelBox) return;
      const ringCenter = ringBox.x + ringBox.width / 2;
      const labelCenter = labelBox.x + labelBox.width / 2;
      test.expect(Math.abs(ringCenter - labelCenter)).toBeLessThan(1);
    });

    test("shows the label of a ring on a brand layer", async ({ q }) => {
      const ring = query(q.article("Ring on a brand layer")).progressbar(
        "Course progress",
      );
      const label = query(ring).text("60%");
      await test.expect(label).toBeVisible();
      test.expect(await isHitAtCenter(label)).toBe(true);
    });
  },
);

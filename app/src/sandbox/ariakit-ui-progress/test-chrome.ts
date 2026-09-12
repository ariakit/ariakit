import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  // Whether the element itself, not something painted over it, is what the
  // pointer reaches at its center. Hit testing only covers the viewport.
  const isHitAtCenter = async (element: Locator) => {
    await element.scrollIntoViewIfNeeded();
    return element.evaluate((node) => {
      const rect = node.getBoundingClientRect();
      const hit = node.ownerDocument.elementFromPoint(
        rect.x + rect.width / 2,
        rect.y + rect.height / 2,
      );
      return !!hit && node.contains(hit);
    });
  };

  // The disc that paints the parent surface back over the center of the ring
  // used to paint over the label too, and the arc's box, whose mask hit testing
  // ignores, took the pointer.
  test("lets the pointer reach the label in the middle of a ring", async ({
    q,
  }) => {
    for (const { box, name, label } of [
      { box: "Ring with label", name: "Photo backup", label: "70%" },
      { box: "Ring on a brand layer", name: "Course progress", label: "60%" },
    ]) {
      const ring = query(q.article(box)).progressbar(name);
      const text = query(ring).text(label);
      await test.expect(text).toBeVisible();
      test.expect(await isHitAtCenter(text)).toBe(true);
    }
  });

  // Regression fixtures.
  test("moves the bar and the ring to each new value", async ({ q }) => {
    const scope = query(q.article("Value change"));
    const bar = scope.progressbar("Build bar");
    const ring = scope.progressbar("Build ring");

    await test.expect(bar).toHaveAttribute("aria-valuenow", "0.2");
    await test.expect(ring).toHaveAttribute("aria-valuenow", "0.2");

    await scope.button("Advance").click();
    await test.expect(bar).toHaveAttribute("aria-valuenow", "0.5");
    await test.expect(ring).toHaveAttribute("aria-valuenow", "0.5");

    await scope.button("Advance").click();
    await scope.button("Advance").click();
    await test.expect(bar).toHaveAttribute("aria-valuenow", "1");
    await test.expect(ring).toHaveAttribute("aria-valuenow", "1");

    await scope.button("Reset").click();
    await test.expect(bar).toHaveAttribute("aria-valuenow", "0");
    await test.expect(ring).toHaveAttribute("aria-valuenow", "0");
    await test.expect(scope.button("Advance")).toBeVisible();
  });
});

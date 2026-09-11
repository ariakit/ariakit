import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

async function getBox(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error("The element has no box");
  return box;
}

withFramework(
  import.meta.dirname,
  { route: "button" },
  async ({ test, query }) => {
    test("a count badge is a pill", async ({ q }) => {
      const slot = query(q.article("Count badge")).text("12").locator("..");
      // A radius concentric with the button collapses to zero at the default
      // padding. Engines print the full radius as different huge lengths.
      await test.expect
        .poll(async () =>
          Number.parseFloat(
            await slot.evaluate((node) => getComputedStyle(node).borderRadius),
          ),
        )
        .toBeGreaterThan(1000);
    });

    test("a badge hue reaches its ring", async ({ q }) => {
      const slot = query(q.article("Badge hue")).text("3").locator("..");
      // The ring copies the layer color, so it keeps the brand hue unless the
      // hue reaches the edge on its own.
      await test.expect
        .poll(() =>
          slot.evaluate((node) =>
            getComputedStyle(node).getPropertyValue("--ak-edge"),
          ),
        )
        .toMatch(/^oklch\(0\.567 0\.1546 142\.5\d*/);
    });

    test("a painted icon slot insets its icon", async ({ q }) => {
      const button = query(q.article("Painted icon slot")).button("Share");
      const icon = button.locator("svg");
      const slot = icon.locator("..");
      const slotBox = await getBox(slot);
      await test.expect
        .poll(async () => (await getBox(icon)).width)
        .toBeCloseTo(slotBox.width * 0.6, 0);
    });

    test("a large slot keeps the label gap of a row", async ({ q }) => {
      const box = query(q.article("Large slot"));
      // The slot's margin reaches the label beside it, one frame padding away.
      await test
        .expect(box.text("Open folder"))
        .toHaveCSS("margin-inline-start", "8px");
    });

    test("horizontal content puts the description beside the label", async ({
      q,
    }) => {
      const box = query(q.article("Horizontal content"));
      const label = await getBox(box.text("Storage"));
      const description = await getBox(box.text("12 GB of 50 GB used"));
      test.expect(description.y).toBeCloseTo(label.y, 0);
      test.expect(description.x).toBeGreaterThan(label.x + label.width);
    });

    test("a floating badge hangs off the end corner", async ({ q }) => {
      // The badge straddles the top edge and the end edge of the button.
      const ltr = query(q.article("Floating badge"));
      const ltrButton = await getBox(ltr.button(/^Updates/));
      const ltrBadge = await getBox(ltr.text("New").locator(".."));
      const ltrEnd = ltrButton.x + ltrButton.width;
      test.expect(ltrBadge.x).toBeLessThan(ltrEnd);
      test.expect(ltrBadge.x + ltrBadge.width).toBeGreaterThan(ltrEnd);
      test.expect(ltrBadge.y + ltrBadge.height / 2).toBeCloseTo(ltrButton.y, 0);

      // In right-to-left text, the end edge is on the left.
      const rtl = query(q.article("Right to left"));
      const rtlButton = await getBox(rtl.button());
      const rtlBadge = await getBox(rtl.text("جديد").locator(".."));
      test.expect(rtlBadge.x).toBeLessThan(rtlButton.x);
      test.expect(rtlBadge.x + rtlBadge.width).toBeGreaterThan(rtlButton.x);
      test.expect(rtlBadge.y + rtlBadge.height / 2).toBeCloseTo(rtlButton.y, 0);
    });
  },
);

import { expect } from "@playwright/test";
import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

/** Border widths in the physical order top, right, bottom, left. */
function getBorderWidths(frame: Locator) {
  return frame.evaluate((element) => {
    const style = getComputedStyle(element);
    return [
      style.borderTopWidth,
      style.borderRightWidth,
      style.borderBottomWidth,
      style.borderLeftWidth,
    ].join(" ");
  });
}

/** The gaps between a cover frame and the border box of its parent. */
function getCoverGeometry(frame: Locator) {
  return frame.evaluate((element) => {
    const parent = element.parentElement;
    if (!parent) {
      throw new Error("Parent not found");
    }
    const rect = element.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      topGap: Math.round(rect.top - parentRect.top),
      leftGap: Math.round(rect.left - parentRect.left),
      rightGap: Math.round(parentRect.right - rect.right),
      bottomGap: Math.round(parentRect.bottom - rect.bottom),
      topLeftRadius: style.borderTopLeftRadius,
      bottomLeftRadius: style.borderBottomLeftRadius,
      bottomRightRadius: style.borderBottomRightRadius,
    };
  });
}

withFramework(import.meta.dirname, async ({ test }) => {
  test("draws the sides that face siblings in a column", async ({ q }) => {
    expect(await getBorderWidths(q.group("Header"))).toBe("0px 0px 1px 0px");
    expect(await getBorderWidths(q.group("Middle"))).toBe("1px 0px 1px 0px");
    expect(await getBorderWidths(q.group("Footer"))).toBe("1px 0px 0px 0px");
  });

  test("keeps the cover stretch and concentric corners", async ({ q }) => {
    const footer = await getCoverGeometry(q.group("Footer"));
    expect(footer).toMatchObject({
      leftGap: 1,
      rightGap: 1,
      bottomGap: 1,
      bottomLeftRadius: "15px",
      bottomRightRadius: "15px",
    });
  });

  test("follows the inline direction in a row", async ({ q }) => {
    expect(await getBorderWidths(q.group("Start ltr"))).toBe("0px 1px 0px 0px");
    expect(await getBorderWidths(q.group("End ltr"))).toBe("0px 0px 0px 1px");
    expect(await getBorderWidths(q.group("Start rtl"))).toBe("0px 0px 0px 1px");
    expect(await getBorderWidths(q.group("End rtl"))).toBe("0px 1px 0px 0px");
  });

  test("applies explicit and inherited widths", async ({ q }) => {
    expect(await getBorderWidths(q.group("Explicit width"))).toBe(
      "4px 0px 0px 0px",
    );
    expect(await getBorderWidths(q.group("Inherited width"))).toBe(
      "4px 0px 0px 0px",
    );
  });

  // https://github.com/ariakit/ariakit/pull/8467#discussion_r4581298207
  test("skips hidden siblings on both sides", async ({ q }) => {
    const first = q.group("First visible");
    expect(await getBorderWidths(first)).toBe("0px 0px 1px 0px");
    expect(await getBorderWidths(q.group("Last visible"))).toBe(
      "1px 0px 0px 0px",
    );
    // The start flag also gives the cover its top stretch and corners.
    expect(await getCoverGeometry(first)).toMatchObject({
      topGap: 1,
      topLeftRadius: "15px",
    });
  });

  test("works without a cover frame", async ({ q }) => {
    expect(await getBorderWidths(q.group("First"))).toBe("0px 0px 1px 0px");
    expect(await getBorderWidths(q.group("Second"))).toBe("1px 0px 0px 0px");
  });
});

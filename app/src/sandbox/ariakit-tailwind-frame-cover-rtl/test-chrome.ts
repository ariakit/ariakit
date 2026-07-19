import { expect } from "@playwright/test";
import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

async function getFrameCoverMetrics(frame: Locator) {
  const cover = frame.locator(".ak-frame-cover");
  await expect(cover).toBeVisible();
  return cover.evaluate((element) => {
    const frame = element.parentElement;
    if (!frame) {
      throw new Error("Frame not found");
    }
    const coverRect = element.getBoundingClientRect();
    const frameRect = frame.getBoundingClientRect();
    const style = getComputedStyle(element);
    return {
      borderBottomLeftRadius: style.borderBottomLeftRadius,
      borderBottomRightRadius: style.borderBottomRightRadius,
      borderTopLeftRadius: style.borderTopLeftRadius,
      borderTopRightRadius: style.borderTopRightRadius,
      leftGap: Math.round(coverRect.left - frameRect.left),
      marginLeft: style.marginLeft,
      marginRight: style.marginRight,
      rightGap: Math.round(frameRect.right - coverRect.right),
    };
  });
}

withFramework(import.meta.dirname, async ({ test }) => {
  test("mirrors frame cover stretch in RTL rows", async ({ q }) => {
    const ltrStart = await getFrameCoverMetrics(
      q.region("LTR frame row start cover"),
    );
    const rtlStart = await getFrameCoverMetrics(
      q.region("RTL frame row start cover"),
    );
    const ltrEnd = await getFrameCoverMetrics(
      q.region("LTR frame row end cover"),
    );
    const rtlEnd = await getFrameCoverMetrics(
      q.region("RTL frame row end cover"),
    );

    expect(rtlStart.rightGap).toBe(ltrStart.leftGap);
    expect(rtlStart.marginRight).toBe(ltrStart.marginLeft);
    expect(rtlStart.marginLeft).toBe(ltrStart.marginRight);
    expect(rtlStart.borderTopRightRadius).toBe(ltrStart.borderTopLeftRadius);
    expect(rtlStart.borderBottomRightRadius).toBe(
      ltrStart.borderBottomLeftRadius,
    );
    expect(rtlStart.borderTopLeftRadius).toBe(ltrStart.borderTopRightRadius);
    expect(rtlStart.borderBottomLeftRadius).toBe(
      ltrStart.borderBottomRightRadius,
    );

    expect(rtlEnd.leftGap).toBe(ltrEnd.rightGap);
    expect(rtlEnd.marginLeft).toBe(ltrEnd.marginRight);
    expect(rtlEnd.marginRight).toBe(ltrEnd.marginLeft);
    expect(rtlEnd.borderTopLeftRadius).toBe(ltrEnd.borderTopRightRadius);
    expect(rtlEnd.borderBottomLeftRadius).toBe(ltrEnd.borderBottomRightRadius);
    expect(rtlEnd.borderTopRightRadius).toBe(ltrEnd.borderTopLeftRadius);
    expect(rtlEnd.borderBottomRightRadius).toBe(ltrEnd.borderBottomLeftRadius);
  });
});

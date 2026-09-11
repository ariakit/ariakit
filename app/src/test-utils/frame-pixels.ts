import type { Locator, Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { PNG } from "pngjs";

export async function edgePixels(page: Page, item: Locator) {
  const metrics = await item.evaluate((element) => {
    const style = getComputedStyle(element);
    return {
      box: element.getBoundingClientRect().toJSON(),
      border: Number.parseFloat(style.borderLeftWidth),
      ring: Number.parseFloat(style.getPropertyValue("--ak-frame-ring")),
    };
  });
  const { box, border, ring } = metrics;
  // Screenshots rasterize integer pixels. Keep the crop origin integral so
  // controls sized by text do not shift our samples outside a fractional edge.
  const clip = {
    x: Math.floor(box.x - 8),
    y: Math.floor(box.y - 8),
    width: Math.ceil(box.right + 8) - Math.floor(box.x - 8),
    height: Math.ceil(box.bottom + 8) - Math.floor(box.y - 8),
  };
  const png = PNG.sync.read(await page.screenshot({ clip, scale: "css" }));
  const inset = (border - ring) / 2;
  const left = box.x - clip.x;
  const top = box.y - clip.y;
  function pixel(x: number, y: number) {
    const offset = (Math.floor(y) * png.width + Math.floor(x)) * 4;
    return [...png.data.subarray(offset, offset + 3)];
  }
  return {
    left: pixel(left + inset, top + box.height / 2),
    right: pixel(left + box.width - inset, top + box.height / 2),
    top: pixel(left + box.width / 2, top + inset),
    bottom: pixel(left + box.width / 2, top + box.height - inset),
  };
}

export function expectSameColor(actual: number[], expected: number[]) {
  for (const [index, channel] of actual.entries()) {
    expect(Math.abs(channel - (expected[index] ?? 0))).toBeLessThanOrEqual(2);
  }
}

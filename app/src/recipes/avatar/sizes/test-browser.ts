import type { Locator } from "@playwright/test";
import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

async function getSize(element: Locator) {
  const box = await element.boundingBox();
  if (!box) {
    throw new Error("The element has no box");
  }
  return [box.width, box.height];
}

function getLineHeight(element: Locator) {
  return element.evaluate((node) =>
    Number.parseFloat(getComputedStyle(node).lineHeight),
  );
}

withFramework(import.meta.dirname, async ({ test }) => {
  test("sizes each avatar from the text around it", async ({ q }) => {
    const twoLines = (await getLineHeight(q.text("Tom Becker"))) * 2;
    await expect
      .poll(() => getSize(q.text("TB")))
      .toEqual([expect.closeTo(twoLines, 0), expect.closeTo(twoLines, 0)]);
    // An avatar of one line does not make the line of the sentence taller.
    const sentence = q.text(/^Assigned to/);
    const oneLine = await getLineHeight(sentence);
    await expect
      .poll(() => getSize(q.text("RD")))
      .toEqual([expect.closeTo(oneLine, 0), expect.closeTo(oneLine, 0)]);
    await expect
      .poll(async () => (await getSize(sentence))[1])
      .toBeCloseTo(oneLine, 0);
    const [headerSize] = await getSize(q.text("HK"));
    test.expect(headerSize).toBeGreaterThan(twoLines);
  });
});

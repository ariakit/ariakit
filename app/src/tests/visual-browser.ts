import { expect, test } from "@playwright/test";
import { getPlaywrightScreenshotOptions } from "#app/test-utils/visual.ts";

test.use({ viewport: { width: 800, height: 600 } });

for (const { width, height, fullPage, expected } of [
  { width: 200, height: 100, fullPage: true, expected: undefined },
  { width: 800, height: 600, fullPage: true, expected: undefined },
  { width: 200, height: 601, fullPage: true, expected: 0 },
  { width: 801, height: 100, fullPage: true, expected: 0 },
  { width: 200, height: 601, fullPage: false, expected: undefined },
]) {
  test(`sets the diff allowance for a ${width}x${height} section with fullPage=${fullPage}`, async ({
    page,
  }) => {
    await page.setContent(`
      <style>body { margin: 0; }</style>
      <article style="width: ${width}px; height: ${height}px">Example</article>
    `);
    const options = await getPlaywrightScreenshotOptions(page, {
      element: page.locator("article"),
      clipMargin: 0,
      fullPage,
    });
    expect(options.maxDiffPixelRatio).toBe(expected);
  });
}

test("uses the section size below the fold in a tall document", async ({
  page,
}) => {
  await page.setContent(`
    <style>body { margin: 0; }</style>
    <div style="height: 1000px"></div>
    <article style="width: 200px; height: 100px">Example</article>
  `);
  const options = await getPlaywrightScreenshotOptions(page, {
    element: page.locator("article"),
    clipMargin: 0,
    fullPage: true,
  });
  expect(options.maxDiffPixelRatio).toBeUndefined();
});

test("trims the section margin to the document before choosing an allowance", async ({
  page,
}) => {
  await page.setContent(`
    <style>body { margin: 0; }</style>
    <article style="width: 800px; height: 600px">Example</article>
  `);
  const options = await getPlaywrightScreenshotOptions(page, {
    element: page.locator("article"),
    fullPage: true,
  });
  expect(options.maxDiffPixelRatio).toBeUndefined();
});

for (const height of [600, 601]) {
  test(`sets the diff allowance for a whole document with height ${height}`, async ({
    page,
  }) => {
    await page.setContent(`
      <style>body { margin: 0; height: ${height}px; }</style>
    `);
    const options = await getPlaywrightScreenshotOptions(page, {
      fullPage: true,
    });
    expect(options.maxDiffPixelRatio).toBe(height > 600 ? 0 : undefined);
  });
}

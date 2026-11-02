import { expect } from "@playwright/test";
import { test } from "#app/test-utils/fixtures.ts";
import { gotoAndSettle } from "#app/test-utils/preview.ts";

test.use({ viewport: { width: 1440, height: 900 } });

test("reading pages set large text in a 42em column beside smaller bars", async ({
  page,
  q,
}) => {
  await gotoAndSettle(page, "/react/recipes/text-field/");
  const prose = q.main().locator(":scope > .shell-main-body > .prose");
  await expect(prose).toHaveCSS("font-size", "18px");
  await expect(prose).toHaveCSS("row-gap", "22.5px");
  await expect(prose).toHaveCSS("width", "756px");
  await expect(q.navigation("Site")).toHaveCSS("font-size", "14px");
  await expect(q.banner()).toHaveCSS("font-size", "14px");
});

test("reading pages space gallery cards like the gutter around them", async ({
  page,
}) => {
  await gotoAndSettle(page, "/react/recipes/text-field/");
  const grid = page.locator(".preview-grid").first();
  await expect(grid).toHaveCSS("padding-inline-start", "28px");
  await expect(grid).toHaveCSS("column-gap", "28px");
  // This gallery stacks its cards directly in the band, without a grid.
  await gotoAndSettle(page, "/react/recipes/combobox-group/");
  const band = page.locator(".shell-main-body > .shell-wide").first();
  await expect(band).toHaveCSS("row-gap", "28px");
});

test("reading pages keep the gutter of the shell's text on a phone", async ({
  page,
  q,
}) => {
  await page.setViewportSize({ width: 390, height: 800 });
  await gotoAndSettle(page, "/react/recipes/text-field/");
  const prose = q.main().locator(":scope > .shell-main-body > .prose");
  await expect(prose).toHaveCSS("font-size", "18px");
  const box = await prose.boundingBox();
  expect(box?.x).toBeCloseTo(14, 0);
  expect(box?.width).toBeCloseTo(362, 0);
});

test("collection pages keep the shell's text and their wide column", async ({
  page,
  q,
}) => {
  await gotoAndSettle(page, "/react/recipes/");
  await expect(q.main()).toHaveCSS("font-size", "14px");
  await expect(q.main()).toHaveCSS("--shell-main-max-width", "1280px");
});

for (const { name, path } of [
  { name: "guide code", path: "/react/components/styling/" },
  { name: "API reference types", path: "/react/components/separator/" },
]) {
  test(`${name} wraps inside the 42em column`, async ({ page, q }) => {
    await gotoAndSettle(page, path);
    const body = q.main().locator(":scope > .shell-main-body");
    // The body clips its overflow, so a long line that leaves its block shows
    // only as extra scroll width here.
    const overflow = await body.evaluate(
      (element) => element.scrollWidth - element.clientWidth,
    );
    expect(overflow).toBe(0);
  });
}

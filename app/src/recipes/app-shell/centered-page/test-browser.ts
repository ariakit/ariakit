import type { Locator } from "@playwright/test";
import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

async function getBox(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error("The element has no box");
  }
  return box;
}

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("spans the bars across the page and lines up their parts with the sidebar rows", async ({
    page,
    q,
  }) => {
    await page.setViewportSize({ width: 1600, height: 900 });
    const guides = query(q.navigation("Guides")).link("Installation");
    const toc = query(q.complementary("On this page")).link("Installation");
    await expect(toc).toBeVisible();
    const banner = await getBox(q.banner());
    expect(banner.x).toBe(0);
    expect(banner.width).toBe(1600);
    // An 80rem box centered in the page, with the rows one bar inset inside.
    const start = await getBox(guides);
    const end = await getBox(toc);
    expect(start.x).toBeCloseTo(171, 0);
    expect(end.x + end.width).toBeCloseTo(1429, 0);
    for (const part of [q.link("Acme Docs"), q.text("© 2026 Acme, Inc.")]) {
      const box = await getBox(part);
      expect(box.x).toBeCloseTo(start.x, 0);
    }
    for (const part of [q.button("Sign in"), q.link("Back to top")]) {
      const box = await getBox(part);
      expect(box.x + box.width).toBeCloseTo(end.x + end.width, 0);
    }
  });

  test("keeps the logo on the sidebar rows below the box width", async ({
    page,
    q,
  }) => {
    await page.setViewportSize({ width: 1100, height: 800 });
    const link = query(q.navigation("Guides")).link("Installation");
    await expect(link).toBeVisible();
    const logo = await getBox(q.link("Acme Docs"));
    const row = await getBox(link);
    expect(logo.x).toBeCloseTo(row.x, 0);
    expect(row.x).toBeLessThan(20);
  });

  test("fits the header on a 320px page", async ({ page, q }) => {
    await page.setViewportSize({ width: 320, height: 640 });
    await expect(q.button("Sign in")).toBeVisible();
    await expect(q.textbox("Search the docs")).toBeHidden();
    // The sidebars fold out after the resize, so the width settles later.
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
      .toBe(320);
  });
});

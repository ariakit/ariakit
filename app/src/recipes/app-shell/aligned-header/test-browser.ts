import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("aligns the search field with the page and keeps it clear of the side parts", async ({
    page,
    q,
  }) => {
    const search = q.textbox("Search the docs").locator("..");
    const column = q.heading("Installation");
    const getBox = async (locator: typeof search) => {
      const box = await locator.boundingBox();
      if (!box) {
        throw new Error("The element has no box");
      }
      return box;
    };
    const expectAligned = async () => {
      await expect
        .poll(async () => (await getBox(search)).x - (await getBox(column)).x)
        .toBeCloseTo(0, 0);
    };
    await page.setViewportSize({ width: 1280, height: 620 });
    await expectAligned();
    const openColumn = await getBox(column);
    const toggle = q.button("Toggle navigation");
    const sidebar = q.navigation("Guides");
    await toggle.click();
    await expect(sidebar).toBeHidden();
    await expectAligned();
    await toggle.click();
    await expect(sidebar).toBeVisible();
    // The panel shows before the column starts to move.
    await expect
      .poll(async () => (await getBox(column)).x)
      .toBeCloseTo(openColumn.x, 0);
    await expectAligned();
    await page.setViewportSize({ width: 500, height: 620 });
    const brand = q.link("Acme Docs");
    await expect
      .poll(async () => {
        const box = await getBox(brand);
        return (await getBox(search)).x - (box.x + box.width);
      })
      .toBeGreaterThan(0);
    const signIn = q.button("Sign in");
    await expect
      .poll(async () => {
        const box = await getBox(search);
        return (await getBox(signIn)).x - (box.x + box.width);
      })
      .toBeGreaterThan(0);
    await expect
      .poll(() => page.evaluate(() => document.documentElement.scrollWidth))
      .toBe(500);
  });
});

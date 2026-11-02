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
    await page.setViewportSize({ width: 1280, height: 620 });
    await expect
      .poll(async () => (await getBox(search)).x - (await getBox(column)).x)
      .toBeCloseTo(0, 0);
    await page.setViewportSize({ width: 500, height: 620 });
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

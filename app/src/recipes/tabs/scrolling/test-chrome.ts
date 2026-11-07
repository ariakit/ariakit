import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("scrolls the strip to the focused tab", async ({ q, page }) => {
    const list = q.tablist("Documentation");
    const tab = q.tab("Changelog");
    // A selected folder crosses the bottom of the strip to join its panel, so
    // only the side that the strip scrolls can show whether the tab fits.
    const getHiddenWidth = async () => {
      const listBox = await list.boundingBox();
      const tabBox = await tab.boundingBox();
      if (!listBox || !tabBox) return null;
      return tabBox.x + tabBox.width - (listBox.x + listBox.width);
    };
    await test.expect.poll(getHiddenWidth).toBeGreaterThan(0);

    await q.tab("Overview").click();
    await page.keyboard.press("End");
    await test.expect(tab).toBeFocused();
    await test.expect(tab).toHaveAttribute("aria-selected", "true");
    await test.expect.poll(getHiddenWidth).toBeLessThanOrEqual(0);
  });

  test("scrolls the strip with a button and keeps focus on the tab", async ({
    q,
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    const list = q.tablist("Documentation");
    const selected = q.tab("Overview");
    await selected.click();
    // The buttons follow the tab list in the Tab order, outside of it.
    await page.keyboard.press("Tab");
    await test.expect(q.button("Next tabs")).toBeFocused();
    await selected.focus();
    await q.button("Next tabs").click();
    await test.expect
      .poll(() => list.evaluate((node) => node.scrollLeft))
      .toBeGreaterThan(0);
    await test.expect(selected).toBeFocused();
    await test.expect(q.button("Previous tabs")).toBeVisible();
  });
});

import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // StrictMode runs the effects of a tab again as it mounts, and this tab is
  // selected as it mounts.
  test("brings a new tab into view in StrictMode", async ({ page, q }) => {
    await page.setViewportSize({ width: 900, height: 500 });
    const newTab = q.button("New tab");
    for (let count = 1; count <= 4; count++) {
      await newTab.click();
    }
    const tab = q.tab("Tab 7");
    await test.expect(tab).toHaveAttribute("aria-selected", "true");
    // The strip clips the tabs that are out of its view.
    await test.expect(tab).toBeInViewport({ ratio: 1 });
  });
});

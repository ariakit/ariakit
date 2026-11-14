import { withFramework } from "#app/test-utils/preview.ts";

// Without JavaScript, the page keeps the server markup.
withFramework(import.meta.dirname, async ({ test, query }) => {
  test.use({ javaScriptEnabled: false });

  test("shows the bar of the current link on the guide before hydration", async ({
    q,
  }) => {
    const nav = q.navigation("Bar on the guide");
    await test.expect(query(nav).link("Guides")).toBeVisible();
    // CSS sets the range of the bar in the current link, and no other link has
    // one.
    const ranges = await nav.evaluate((element) => {
      const bars = [...element.querySelectorAll(".nav-link-guide-bar")];
      return bars.map((bar) => {
        const style = getComputedStyle(bar);
        const start = style.getPropertyValue("--nav-bar-start");
        const end = style.getPropertyValue("--nav-bar-end");
        const name = bar.closest("a")?.textContent ?? "";
        return { name, empty: start === "0px" && end === "0px" };
      });
    });
    const shown = ranges.filter((range) => !range.empty);
    test.expect(shown.map((range) => range.name)).toEqual(["Guides"]);
  });
});

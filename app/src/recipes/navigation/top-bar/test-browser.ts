import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("keeps the links clickable while the bar moves", async ({ page, q }) => {
    // The bar duration is a theme token. A long one keeps the transition
    // running while the test presses another link.
    await page.addStyleTag({ content: ":root { --duration-bar: 30s; }" });
    const nav = query(q.navigation("Main"));
    const transition = page.locator(":root:active-view-transition");
    await nav.link("Analytics").click();
    await test.expect(transition).toHaveCount(1);
    // Locator actions wait until nothing covers the link, so they would press
    // it only after the transition. The raw mouse presses whatever the browser
    // hits now. A captured page takes the press in Firefox.
    const projects = nav.link("Projects");
    const box = await projects.boundingBox();
    if (!box) throw new Error("The Projects link has no box");
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await test.expect
      .poll(() => projects.evaluate((link) => link.matches(":active")))
      .toBe(true);
    await test.expect(transition).toHaveCount(1);
    await page.mouse.up();
  });
});

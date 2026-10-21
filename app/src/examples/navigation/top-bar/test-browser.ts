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

  test("keeps the current link still while pressed", async ({ page, q }) => {
    const nav = query(q.navigation("Main"));
    const getScale = (name: string) =>
      nav.link(name).evaluate((element) => getComputedStyle(element).scale);
    const press = async (name: string) => {
      await nav.link(name).hover();
      await page.mouse.down();
    };
    await press("Projects");
    await test.expect.poll(() => getScale("Projects")).not.toBe("none");
    await page.mouse.up();
    await test
      .expect(nav.link("Projects"))
      .toHaveAttribute("aria-current", "page");
    await press("Projects");
    // The press scale eases in over 100ms, so the current link must stay at
    // full size past that.
    await page.waitForTimeout(150);
    test.expect(await getScale("Projects")).toBe("none");
    await page.mouse.up();
  });
});

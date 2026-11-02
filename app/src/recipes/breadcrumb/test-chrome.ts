import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("marks the page as text and keeps the separators hidden", async ({
    q,
  }) => {
    const trail = query(q.navigation("Breadcrumb"));
    await test.expect(trail.link("Home")).toBeVisible();
    await test.expect(trail.link("Garden")).toBeVisible();
    await test.expect(trail.link("Tools")).toBeVisible();
    await test.expect(trail.link("Pruning shears")).toHaveCount(0);
    await test
      .expect(trail.text("Pruning shears"))
      .toHaveAttribute("aria-current", "page");
    await test.expect(trail.listitem()).toHaveCount(4);
  });

  test("gives each link a target of at least 24 pixels", async ({ q }) => {
    for (const name of ["Home", "Garden", "Tools"]) {
      const box = await q.link(name).boundingBox();
      test.expect(box?.height).toBeGreaterThanOrEqual(24);
      test.expect(box?.width).toBeGreaterThanOrEqual(24);
    }
  });

  test("lines up the home icon with the text around the trail", async ({
    q,
  }) => {
    const offset = await q.navigation("Breadcrumb").evaluate((trail) => {
      const icon = trail.querySelector("svg")?.getBoundingClientRect();
      return Math.abs((icon?.left ?? 0) - trail.getBoundingClientRect().left);
    });
    test.expect(offset).toBeLessThan(0.5);
  });

  test("centers the home icon in its step", async ({ q }) => {
    const offset = await q.link("Home").evaluate((link) => {
      const icon = link.querySelector("svg")?.getBoundingClientRect();
      const box = link.getBoundingClientRect();
      const start = (icon?.left ?? 0) - box.left;
      return Math.abs(start - (box.right - (icon?.right ?? 0)));
    });
    test.expect(offset).toBeLessThan(0.5);
  });

  test("hides the marks beside a step with a focus surface", async ({
    page,
    q,
  }) => {
    const mark = q.navigation("Breadcrumb").locator("li[aria-hidden]").first();
    await test.expect(mark).toHaveCSS("opacity", "1");
    await page.keyboard.press("Tab");
    await test.expect(q.link("Home")).toBeFocused();
    await test.expect(mark).toHaveCSS("opacity", "0");
  });

  test("hides the mark beside a step with a hover surface", async ({ q }) => {
    const mark = q.navigation("Breadcrumb").locator("li[aria-hidden]").first();
    await q.link("Home").hover();
    await test.expect(mark).toHaveCSS("opacity", "0");
  });

  test("keeps the marks beside a quiet link on hover", async ({ page, q }) => {
    const marks = q.navigation("Breadcrumb").locator("li[aria-hidden]");
    const tools = q.link("Tools");
    await tools.hover();
    await test.expect(tools).toHaveCSS("text-decoration-line", "underline");
    // A hiding mark would start its 200ms transition here. No state tracks a
    // mark that stays, so wait past the transition before the assertions.
    await page.waitForTimeout(300);
    await test.expect(marks.nth(1)).toHaveCSS("opacity", "1");
    await test.expect(marks.nth(2)).toHaveCSS("opacity", "1");
  });

  test("keeps the mark beside the current step on hover", async ({
    page,
    q,
  }) => {
    const mark = q.navigation("Breadcrumb").locator("li[aria-hidden]").last();
    await q.text("Pruning shears").hover();
    // A hiding mark would start its 200ms transition here. No state tracks a
    // mark that stays, so wait past the transition before the assertion.
    await page.waitForTimeout(300);
    await test.expect(mark).toHaveCSS("opacity", "1");
  });

  test("lets the text of the trail be selected", async ({ q }) => {
    await test.expect(q.link("Garden")).toHaveCSS("user-select", "text");
    await test
      .expect(q.text("Pruning shears"))
      .toHaveCSS("user-select", "text");
  });

  test("shows no surface on hover, and lifts the ink and underlines the link", async ({
    q,
  }) => {
    const link = q.link("Garden");
    const restColor = await link.evaluate(
      (element) => getComputedStyle(element).color,
    );
    const restBackground = await link.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    );
    await test.expect(link).toHaveCSS("text-decoration-line", "none");
    await link.hover();
    await test.expect(link).not.toHaveCSS("color", restColor);
    await test.expect(link).toHaveCSS("background-color", restBackground);
    await test.expect(link).toHaveCSS("text-decoration-line", "underline");
    const current = q.text("Pruning shears");
    const currentColor = await current.evaluate(
      (element) => getComputedStyle(element).color,
    );
    await current.hover();
    await test.expect(current).toHaveCSS("color", currentColor);
    await test.expect(current).toHaveCSS("cursor", "default");
  });
});

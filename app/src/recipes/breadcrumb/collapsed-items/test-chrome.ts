import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test, query }) => {
  test("hides the marks beside the hovered button only when the gap is small", async ({
    page,
    q,
  }) => {
    const trail = q.navigation("Breadcrumb");
    const before = trail.locator("li[aria-hidden]").nth(0);
    const after = trail.locator("li[aria-hidden]").nth(1);
    const button = q.button("Show 3 more steps");
    await button.hover();
    await test.expect(before).toHaveCSS("opacity", "0");
    await test.expect(after).toHaveCSS("opacity", "0");
    // $gap sets this property, and a wider gap leaves room for the surface.
    await trail.evaluate((element) => {
      element.style.setProperty("--breadcrumb-gap", "1rem");
    });
    await test.expect(before).toHaveCSS("opacity", "1");
    await test.expect(after).toHaveCSS("opacity", "1");
    await page.mouse.move(0, 0);
  });

  test("reveals the hidden steps and returns focus on Escape", async ({
    page,
    q,
  }) => {
    const button = q.button("Show 3 more steps");
    await test.expect(q.link("Engineering")).toBeHidden();
    await button.click();
    const hidden = query(q.navigation("More steps"));
    await test.expect(hidden.link("Engineering")).toBeVisible();
    await test.expect(hidden.link("Platform team")).toBeVisible();
    await test.expect(hidden.link("Observability")).toBeVisible();
    await page.keyboard.press("Escape");
    await test.expect(q.link("Engineering")).toBeHidden();
    await test.expect(button).toBeFocused();
  });
});

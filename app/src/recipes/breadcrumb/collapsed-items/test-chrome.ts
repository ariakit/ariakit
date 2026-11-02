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

  test("shows a surface and hides the marks beside the expanded button only when the gap is small", async ({
    page,
    q,
  }) => {
    const trail = q.navigation("Breadcrumb");
    const before = trail.locator("li[aria-hidden]").nth(0);
    const after = trail.locator("li[aria-hidden]").nth(1);
    const farther = trail.locator("li[aria-hidden]").nth(2);
    const button = q.button("Show 3 more steps");
    const restBackground = await button.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    );
    await button.click();
    await test.expect(button).toHaveAttribute("aria-expanded", "true");
    // Without the pointer on the button, only the open state can explain the
    // surface and the hidden marks.
    await page.mouse.move(0, 0);
    await test.expect(button).not.toHaveCSS("background-color", restBackground);
    await test.expect(before).toHaveCSS("opacity", "0");
    await test.expect(after).toHaveCSS("opacity", "0");
    await test.expect(farther).toHaveCSS("opacity", "1");
    // A wider gap leaves room for the surface, so the marks return.
    await trail.evaluate((element) => {
      element.style.setProperty("--breadcrumb-gap", "1rem");
    });
    await test.expect(before).toHaveCSS("opacity", "1");
    await test.expect(after).toHaveCSS("opacity", "1");
    await trail.evaluate((element) => {
      element.style.removeProperty("--breadcrumb-gap");
    });
    await page.keyboard.press("Escape");
    await test.expect(button).toHaveAttribute("aria-expanded", "false");
    // Escape returns focus to the button with a ring, which also hides the
    // marks, so move focus away before checking the closed state.
    await button.blur();
    await test.expect(button).toHaveCSS("background-color", restBackground);
    await test.expect(before).toHaveCSS("opacity", "1");
    await test.expect(after).toHaveCSS("opacity", "1");
  });

  test("keeps the surface when the pointer returns to the expanded button", async ({
    page,
    q,
  }) => {
    const button = q.button("Show 3 more steps");
    // $selectedOffset sets this property. The recipe's value equals the hover
    // offset, so a stronger one is what tells the two surfaces apart.
    await button.evaluate((element) => {
      element.style.setProperty("--selected-offset", "0.12");
    });
    await button.click();
    await page.mouse.move(0, 0);
    await test.expect(button).toHaveAttribute("aria-expanded", "true");
    const expandedBackground = await button.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    );
    await button.hover();
    await test.expect(button).toHaveCSS("background-color", expandedBackground);
  });

  test("paints the push of the expanded button and ignores an inherited one", async ({
    page,
    q,
  }) => {
    const trail = q.navigation("Breadcrumb");
    const button = q.button("Show 3 more steps");
    await button.click();
    await page.mouse.move(0, 0);
    await test.expect(button).toHaveAttribute("aria-expanded", "true");
    const expandedBackground = await button.evaluate(
      (element) => getComputedStyle(element).backgroundColor,
    );
    // Computed styles update on read and the button has no background
    // transition, so this unchanged color needs no wait.
    await trail.evaluate((element) => {
      element.style.setProperty("--selected-push", "0.2");
    });
    await test.expect(button).toHaveCSS("background-color", expandedBackground);
    // $selectedPush sets this property on the button itself.
    await button.evaluate((element) => {
      element.style.setProperty("--selected-push", "0.2");
    });
    await test
      .expect(button)
      .not.toHaveCSS("background-color", expandedBackground);
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

import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("keeps focus on the link when the text stops being clipped", async ({
    page,
    q,
  }) => {
    const trail = q.navigation("Breadcrumb");
    const link = q.link("Regional operations and logistics");
    await link.focus();
    await test.expect(link).toBeFocused();
    await trail.evaluate((element) => {
      const wrapper = element.parentElement;
      if (!wrapper) return;
      wrapper.style.width = "70rem";
      wrapper.style.maxWidth = "none";
    });
    const label = link.locator(".breadcrumb-truncate");
    await test.expect
      .poll(() =>
        label.evaluate(
          (element) => element.scrollHeight > element.clientHeight,
        ),
      )
      .toBe(false);
    // Code that reacts to the new width, such as a resize observer that removes
    // the tooltip, runs after layout and could replace the link. No state
    // tracks a link that stays, so wait for such a callback and its render.
    await page.waitForTimeout(200);
    await test.expect(link).toBeFocused();
    await q.link("Northwind").focus();
    await link.focus();
    // Keyboard focus opens a tooltip with no delay, and no state tracks a
    // tooltip that stays closed, so wait a moment before the assertion.
    await page.waitForTimeout(100);
    await test
      .expect(q.tooltip("Regional operations and logistics"))
      .toHaveCount(0);
  });

  test("shows the full text in a tooltip on keyboard focus", async ({ q }) => {
    const link = q.link("Regional operations and logistics");
    await link.focus();
    await test
      .expect(q.tooltip("Regional operations and logistics"))
      .toBeVisible();
  });
});

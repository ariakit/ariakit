import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("goes to a neighbor on Enter and returns focus", async ({ page, q }) => {
    const trigger = q.combobox("Switch section");
    await trigger.focus();
    await page.keyboard.press("ArrowDown");
    await test.expect(q.option("Areas")).toBeVisible();
    await page.keyboard.press("ArrowDown");
    // Moving through the list must not navigate.
    await test.expect(page).not.toHaveURL(/#areas$/);
    await page.keyboard.press("Enter");
    await test.expect(page).toHaveURL(/#areas$/);
    await test.expect(trigger).toBeFocused();
  });

  test("goes to a neighbor on click", async ({ page, q }) => {
    await q.combobox("Switch section").click();
    await q.option("Reading list").click();
    await test.expect(page).toHaveURL(/#reading-list$/);
    await test.expect(q.navigation("Breadcrumb")).toContainText("Reading list");
  });

  // A default value would change here without leaving the page.
  test("keeps the current step when typing on the closed button", async ({
    page,
    q,
  }) => {
    await q.combobox("Switch section").focus();
    await page.keyboard.press("a");
    await test.expect(q.navigation("Breadcrumb")).toContainText("Projects");
    await test.expect(q.navigation("Breadcrumb")).not.toContainText("Areas");
    await test.expect(page).not.toHaveURL(/#areas$/);
    await page.keyboard.press("ArrowDown");
    await test
      .expect(q.option("Projects"))
      .toHaveAttribute("aria-selected", "true");
    await test
      .expect(q.option("Areas"))
      .toHaveAttribute("aria-selected", "false");
  });

  // The current step sits between the mark and the button.
  test("keeps the mark when the button beside the current step is hovered", async ({
    page,
    q,
  }) => {
    const mark = q.navigation("Breadcrumb").locator("li[aria-hidden]");
    await q.combobox("Switch section").hover();
    // A hiding mark would start its 200ms transition here. No state tracks a
    // mark that stays, so wait past the transition before the assertion.
    await page.waitForTimeout(300);
    await test.expect(mark).toHaveCSS("opacity", "1");
  });

  test("centers the arrow in the button", async ({ q }) => {
    const trigger = q.combobox("Switch section");
    const offset = await trigger.evaluate((element) => {
      const icon = element.querySelector("svg")?.getBoundingClientRect();
      const box = element.getBoundingClientRect();
      const start = (icon?.left ?? 0) - box.left;
      const end = box.right - (icon?.right ?? 0);
      return Math.abs(start - end);
    });
    test.expect(offset).toBeLessThan(1);
  });

  test("gives the button a target of at least 24 pixels", async ({ q }) => {
    const box = await q.combobox("Switch section").boundingBox();
    test.expect(box?.height).toBeGreaterThanOrEqual(24);
    test.expect(box?.width).toBeGreaterThanOrEqual(24);
  });
});

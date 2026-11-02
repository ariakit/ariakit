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

  test("follows the page when going back", async ({ page, q }) => {
    await q.combobox("Switch section").click();
    await q.option("Areas").click();
    await test.expect(q.navigation("Breadcrumb")).toContainText("Areas");
    await page.goBack();
    await test.expect(q.navigation("Breadcrumb")).toContainText("Projects");
  });

  test("keeps the step when a link opens in a new tab", async ({
    context,
    page,
    q,
  }) => {
    await q.combobox("Switch section").click();
    const newPage = context.waitForEvent("page");
    await q.option("Areas").click({ modifiers: ["ControlOrMeta"] });
    await newPage;
    await test.expect(q.navigation("Breadcrumb")).toContainText("Projects");
    await test.expect(page).not.toHaveURL(/#areas$/);
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

  test("gives the button a target of at least 24 pixels", async ({ q }) => {
    const box = await q.combobox("Switch section").boundingBox();
    test.expect(box?.height).toBeGreaterThanOrEqual(24);
    test.expect(box?.width).toBeGreaterThanOrEqual(24);
  });
});

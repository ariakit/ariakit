import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("collapses provider-driven sidebars from the toggle", async ({ q }) => {
    await test.expect(q.dialog("Primary sidebar")).toBeVisible();

    await q.button("Collapse sidebar").click();

    await test.expect(q.dialog("Primary sidebar")).not.toBeVisible();
    await test.expect(q.button("Expand sidebar")).toBeVisible();

    await q.button("Expand sidebar").click();

    await test.expect(q.dialog("Primary sidebar")).toBeVisible();
    await test.expect(q.button("Collapse sidebar")).toBeFocused();
  });

  test("keeps standalone sidebars visible inside other dialogs", async ({
    q,
  }) => {
    await test
      .expect(q.text("Nested standalone sidebar content"))
      .toBeVisible();
  });

  test.describe("mobile", () => {
    test.use({ viewport: { height: 844, width: 390 } });

    test("hides provider-driven sidebars with Escape", async ({ page, q }) => {
      await test.expect(q.dialog("Primary sidebar")).toBeVisible();

      await page.keyboard.press("Escape");

      await test.expect(q.dialog("Primary sidebar")).not.toBeVisible();
      await test.expect(q.button("Expand sidebar")).toBeVisible();
    });

    test("hides provider-driven sidebars on outside clicks", async ({
      page,
      q,
    }) => {
      await test.expect(q.dialog("Primary sidebar")).toBeVisible();

      await page.mouse.click(380, 20);

      await test.expect(q.dialog("Primary sidebar")).not.toBeVisible();
      await test.expect(q.button("Expand sidebar")).toBeVisible();
    });
  });
});

import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/7036
  test("hide on escape with a persistent nested hovercard", async ({
    page,
    q,
  }) => {
    await q.checkbox("Include preview").click();
    await q.link("Post").click();
    await test.expect(q.text("Feature preview")).toBeVisible();

    await page.keyboard.press("Escape");

    await test.expect(q.dialog("Post")).not.toBeVisible();
    await test.expect(q.text("Feature preview")).not.toBeVisible();
  });
});

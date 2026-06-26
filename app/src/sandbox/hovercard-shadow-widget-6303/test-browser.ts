import { withFramework } from "#app/test-utils/preview.ts";

const afterHideTimeout = 600;

withFramework(import.meta.dirname, async ({ test }) => {
  // Reproduces https://github.com/ariakit/ariakit/issues/6303
  test("keeps the hovercard visible when the pointer is over a shadow root widget", async ({
    page,
    q,
  }) => {
    await q.link("@ariakit.com").hover();
    await test.expect(q.dialog("Profile card")).toBeVisible();

    await q.text("Toolkit with accessible components.").hover();
    await q.button("Follow").hover();
    // The default hide timeout is 500ms.
    await page.waitForTimeout(afterHideTimeout);

    await test.expect(q.dialog("Profile card")).toBeVisible();
  });
});

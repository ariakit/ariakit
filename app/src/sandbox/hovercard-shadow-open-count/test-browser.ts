import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // https://github.com/ariakit/ariakit/issues/2983
  test("counts one opening while moving within a shadow anchor", async ({
    page,
    q,
  }) => {
    const anchor = q.link("@ariakit.com");
    const hovercard = q.dialog("Ariakit");

    await anchor.hover();
    await test.expect(hovercard).toBeVisible();
    await test.expect(q.text("Opened 1 times")).toBeVisible();
    await anchor.hover({ position: { x: 10, y: 10 } });
    await test.expect(q.text("Opened 1 times")).toBeVisible();
    await anchor.hover({ position: { x: 20, y: 10 } });
    await test.expect(q.text("Opened 1 times")).toBeVisible();
    await page.mouse.move(0, 0);
    await test.expect(hovercard).not.toBeVisible();
    await anchor.hover();
    await test.expect(hovercard).toBeVisible();
    await test.expect(q.text("Opened 2 times")).toBeVisible();
  });
});

import { withFramework } from "#app/test-utils/preview.ts";

// The tooltips of the sandbox show after 20ms.
const TIMEOUT = 20;

withFramework(import.meta.dirname, async ({ test }) => {
  test("hideOnClick hides the tooltip until the pointer leaves the anchor", async ({
    page,
    q,
  }) => {
    const anchor = q.button("Italic");
    const tooltip = q.tooltip("Italic label");
    await anchor.hover();
    await test.expect(tooltip).toBeVisible();
    await anchor.click();
    await test.expect(tooltip).toBeHidden();
    // The pointer moves on the anchor, which doesn't show the tooltip again.
    // The tooltip would show after its timeout, and no state shows that the
    // timeout passed without it.
    await anchor.hover({ position: { x: 2, y: 2 } });
    await anchor.hover({ position: { x: 4, y: 4 } });
    await page.waitForTimeout(TIMEOUT + 100);
    await test.expect(tooltip).toBeHidden();
    // Once the pointer leaves the anchor, the anchor shows it again.
    await page.mouse.move(0, 0);
    await anchor.hover();
    await test.expect(tooltip).toBeVisible();
  });
});

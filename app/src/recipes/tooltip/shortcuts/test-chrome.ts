import { withFramework } from "#app/test-utils/preview.ts";
import { SHOW_TIMEOUT, watchOpening } from "#app/test-utils/tooltip.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("names the icon buttons and shows their shortcuts", async ({ q }) => {
    const bold = q.button("Bold");
    await test.expect(bold).toHaveAttribute("aria-keyshortcuts", /^\w+\+B$/);
    // Ariakit resets hover intent on scroll, so the anchor must be in view
    // before the pointer moves over it.
    await bold.scrollIntoViewIfNeeded();
    await bold.hover();
    await test.expect(q.tooltip(/^Bold\s*(⌘|Ctrl\+)\s*B$/)).toBeVisible();
  });

  test("shows the next tooltip at once while the pointer moves along the toolbar", async ({
    q,
  }) => {
    const bold = q.button("Bold");
    const italic = q.button("Italic");
    await bold.scrollIntoViewIfNeeded();
    await bold.hover();
    await test.expect(q.tooltip(/^Bold/)).toBeVisible();
    const opening = await watchOpening(italic, "Italic");
    await italic.hover();
    const { delay, animations } = await opening();
    // Without the skip window, the tooltip would wait for the show timeout.
    test.expect(delay).toBeLessThan(SHOW_TIMEOUT);
    // The tooltip still plays its enter animation.
    test.expect(animations).toBeGreaterThan(0);
    // The replaced tooltip skips its exit transition, so the two tooltips don't
    // overlap: it is already unmounted, or it no longer paints. A retrying
    // assertion would also pass after a fade.
    const boldOpacities = await q
      .tooltip(/^Bold/, { includeHidden: true })
      .evaluateAll((elements) =>
        elements.map((element) => getComputedStyle(element).opacity),
      );
    test.expect(boldOpacities.filter((opacity) => opacity !== "0")).toEqual([]);
    await test.expect(q.tooltip(/^Italic/)).toBeVisible();
    await test.expect(q.tooltip()).toHaveCount(1);
  });

  test("shows the tooltip on keyboard focus and hides it on Escape", async ({
    page,
    q,
  }) => {
    await page.keyboard.press("Tab");
    const bold = q.button("Bold");
    await test.expect(bold).toBeFocused();
    await test.expect(q.tooltip(/^Bold/)).toBeVisible();
    // The toolbar moves focus with the arrow keys, and the tooltip follows.
    await page.keyboard.press("ArrowRight");
    await test.expect(q.button("Italic")).toBeFocused();
    await test.expect(q.tooltip(/^Italic/)).toBeVisible();
    await page.keyboard.press("Escape");
    await test.expect(q.tooltip(/^Italic/)).toBeHidden();
    await test.expect(q.button("Italic")).toBeFocused();
  });
});

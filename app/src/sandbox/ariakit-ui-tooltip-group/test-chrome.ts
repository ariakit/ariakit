import { tabTo } from "#app/test-utils/ariakit-ui.ts";
import { withFramework } from "#app/test-utils/preview.ts";
import {
  SHOW_TIMEOUT,
  SKIP_TIMEOUT,
  watchOpening,
} from "#app/test-utils/tooltip.ts";

withFramework(import.meta.dirname, async ({ query, test }) => {
  test("moves the shared tooltip with Tab and hides it on Escape", async ({
    page,
    q,
  }) => {
    const section = q.region("Slide");
    await tabTo(page, query(section).button("One"));
    await test.expect(q.tooltip("One tooltip")).toBeVisible();
    await page.keyboard.press("Tab");
    await test.expect(query(section).button("Two")).toBeFocused();
    await test.expect(q.tooltip("Two tooltip")).toBeVisible();
    await test.expect(q.tooltip()).toHaveCount(1);
    await page.keyboard.press("Escape");
    await test.expect(q.tooltip("Two tooltip")).toBeHidden();
    await test.expect(query(section).button("Two")).toBeFocused();
  });

  test("updates the shared tooltip while it shows", async ({ page, q }) => {
    await tabTo(page, q.button("Zoom in"));
    await test.expect(q.tooltip("Zoom in (100%)")).toBeVisible();
    await page.keyboard.press("Enter");
    await test.expect(q.tooltip("Zoom in (110%)")).toBeVisible();
    await page.keyboard.press("Shift+Tab");
    await test.expect(q.tooltip("Zoom out (110%)")).toBeVisible();
    await test.expect(q.tooltip()).toHaveCount(1);
  });

  // Empty content keeps the anchor, which can still get focus, but it must not
  // open a tooltip that the next tooltip skips its delay for.
  test("keeps the show delay after an anchor without content", async ({
    page,
    q,
  }) => {
    const section = q.region("Empty content");
    const four = query(section).button("Four");
    // Ariakit resets hover intent on scroll, so the anchor must be in view
    // before the pointer moves over it.
    await four.scrollIntoViewIfNeeded();
    const opening = await watchOpening(four, "Four tooltip");
    // The hover must come within the 300ms that a closed tooltip stays active,
    // so the focus check waits until after it.
    await page.keyboard.press("Tab");
    await four.hover();
    await test.expect(query(section).button("No tooltip")).toBeFocused();
    const { delay } = await opening();
    test.expect(delay).toBeGreaterThanOrEqual(SHOW_TIMEOUT);
  });

  test("keeps the group props that a tooltip leaves undefined", async ({
    page,
    q,
  }) => {
    const section = q.region("Brand");
    const getBackground = (name: string) => {
      return q
        .tooltip(name)
        .evaluate((element) => getComputedStyle(element).backgroundColor);
    };
    await tabTo(page, query(section).button("Five"));
    await test.expect(q.tooltip("Five tooltip")).toBeVisible();
    const groupBackground = await getBackground("Five tooltip");
    await page.keyboard.press("Tab");
    await test.expect(q.tooltip("Six tooltip")).toBeVisible();
    test.expect(await getBackground("Six tooltip")).toBe(groupBackground);
  });

  test("closes the shared tooltip when its anchor unmounts", async ({
    page,
    q,
  }) => {
    const section = q.region("Removable");
    const design = query(section).button("Remove Design");
    await design.scrollIntoViewIfNeeded();
    await design.hover();
    await test.expect(q.tooltip("Remove Design")).toBeVisible();
    await design.click();
    await test.expect(design).toHaveCount(0);
    await page.mouse.move(0, 0);
    // A tooltip that closed stays the active one for a while. The next tooltip
    // must open after its show delay, as a new tooltip.
    await page.waitForTimeout(SKIP_TIMEOUT);
    const research = query(section).button("Remove Research");
    const opening = await watchOpening(research, "Remove Research");
    await research.hover();
    const { delay } = await opening();
    test.expect(delay).toBeGreaterThanOrEqual(SHOW_TIMEOUT);
  });
});

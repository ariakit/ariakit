import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

// Whether the glider sits over the tab: its center falls inside the tab's box.
// A glider that is not rendered has no box and covers nothing.
async function covers(glider: Locator, tab: Locator) {
  const [gliderBox, tabBox] = await Promise.all([
    glider.boundingBox(),
    tab.boundingBox(),
  ]);
  if (!gliderBox) return false;
  if (!tabBox) return false;
  const center = gliderBox.x + gliderBox.width / 2;
  return center > tabBox.x && center < tabBox.x + tabBox.width;
}

withFramework(
  import.meta.dirname,
  { route: "tabs" },
  async ({ test, query }) => {
    // Gliders are decorative and have no role, so their state classes locate
    // them. The hover glider is the one with no state class.
    const getGliders = (article: Locator) => ({
      selected: article.locator(".glider.selected"),
      hover: article.locator(".glider:not(.selected, .focus)"),
      focus: article.locator(".glider.focus"),
    });

    test("the hover glider follows the pointer", async ({ q }) => {
      const article = q.article("Folder glider");
      const box = query(article);
      const gliders = getGliders(article);
      await test.expect(gliders.hover).toBeHidden();
      await test.expect
        .poll(() => covers(gliders.selected, box.tab("Code")))
        .toBe(true);

      const preview = box.tab("Preview");
      const usage = box.tab("Usage");
      // A synthesized pointer move that scrolls the strip into view does not
      // apply :hover in WebKit until the pointer enters another element, so the
      // pointer passes over Usage on its way to Preview.
      await usage.hover();
      await preview.hover();
      await test.expect(gliders.hover).toBeVisible();
      await test.expect.poll(() => covers(gliders.hover, preview)).toBe(true);
      await test.expect
        .poll(() => covers(gliders.selected, box.tab("Code")))
        .toBe(true);

      await usage.hover();
      await test.expect.poll(() => covers(gliders.hover, usage)).toBe(true);
    });

    test("the focus glider follows the keyboard without selecting", async ({
      page,
      q,
    }) => {
      const article = q.article("Folder glider");
      const box = query(article);
      const gliders = getGliders(article);
      await test.expect(gliders.focus).toBeHidden();

      await box.tab("Code").click();
      await page.keyboard.press("ArrowRight");
      await test.expect(box.tab("Usage")).toBeFocused();
      await test
        .expect(box.tab("Usage"))
        .toHaveAttribute("aria-selected", "false");
      await test
        .expect(box.tab("Code"))
        .toHaveAttribute("aria-selected", "true");
      await test.expect(gliders.focus).toBeVisible();
      await test.expect
        .poll(() => covers(gliders.focus, box.tab("Usage")))
        .toBe(true);
      await test.expect
        .poll(() => covers(gliders.selected, box.tab("Code")))
        .toBe(true);

      // The selected glider marks keyboard focus on the tab it covers with a
      // thicker top edge, which it does not have while focus is elsewhere.
      const getTopEdge = () =>
        gliders.selected.evaluate(
          (node) => getComputedStyle(node).borderTopWidth,
        );
      const restingTopEdge = await getTopEdge();

      await page.keyboard.press("Enter");
      await test
        .expect(box.tab("Usage"))
        .toHaveAttribute("aria-selected", "true");
      await test.expect
        .poll(() => covers(gliders.selected, box.tab("Usage")))
        .toBe(true);
      await test.expect.poll(getTopEdge).not.toBe(restingTopEdge);
    });
  },
);

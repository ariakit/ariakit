import type { Page } from "@playwright/test";
import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

const tab1 = "Popular";
const tab2 = "Recent";
const tab3 = "Explore";

// The panels transition for only 300ms, and separate assertions on a loaded
// runner can outlast that. Read every visible panel in one round trip so each
// check sees the panels at the same moment.
function getPanelMotion(page: Page) {
  return page.evaluate(() => {
    const motion: Record<string, string> = {};
    for (const panel of document.querySelectorAll("[role=tabpanel]")) {
      if (!panel.checkVisibility()) continue;
      const tabId = panel.getAttribute("aria-labelledby");
      const tab = tabId ? document.getElementById(tabId) : null;
      if (!tab?.textContent) continue;
      const { translate, opacity } = getComputedStyle(panel);
      const side = translate.startsWith("-")
        ? "start"
        : translate === "0px" || translate === "none"
          ? "center"
          : "end";
      motion[tab.textContent] = opacity === "1" ? side : `${side} fading`;
    }
    return motion;
  });
}

// The default poll intervals (100ms, then 250ms) skip most of a 300ms
// transition, so sample about once per frame instead.
const intervals = [16];

withFramework(import.meta.dirname, async ({ test }) => {
  test("switch tabs", async ({ page, q }) => {
    await expect(q.tab(tab1)).toHaveAttribute("aria-selected", "true");
    await expect(q.tabpanel(tab1)).toBeVisible();

    // Transition from [1] to [1]←[ ]←[2].
    await q.tab(tab2).click();

    await expect
      .poll(() => getPanelMotion(page), { intervals })
      .toEqual({ [tab1]: "start fading", [tab2]: "end fading" });

    // Move again before the first panel transition completes.
    await page.keyboard.press("ArrowRight");

    // Interrupting it adds panel 3: [1]←[ ]←[2]←[3]. Tab 1 is still sliding to
    // the left, and tab 3 is sliding from the right. Tab 2 reverses towards the
    // left right away, so it can be on either side here.
    await expect
      .poll(() => getPanelMotion(page), { intervals })
      .toEqual({
        [tab1]: "start fading",
        [tab2]: expect.stringMatching(/^(start|end) fading$/),
        [tab3]: "end fading",
      });
    await expect(q.tab(tab3)).toBeFocused();

    // [1]←[2]←[ ]←[3]

    // Tab 2 is now sliding to the left, while tab 3 is still sliding from the
    // right.
    await expect
      .poll(() => getPanelMotion(page), { intervals })
      .toMatchObject({ [tab2]: "start fading", [tab3]: "end fading" });

    // [3]

    // Tab 3 is finally settled, and the other panels are hidden.
    await expect.poll(() => getPanelMotion(page)).toEqual({ [tab3]: "center" });

    // Pressing the Home key after the animation is complete
    await page.keyboard.press("Home");

    // [1]→[ ]→[3]

    // Only the first and last panels are visible. Tab 1 is sliding from the
    // left, and tab 3 is sliding to the right.
    await expect
      .poll(() => getPanelMotion(page), { intervals })
      .toEqual({ [tab1]: "start fading", [tab3]: "end fading" });
    await expect(q.tab(tab1)).toBeFocused();

    // [1]

    // Tab 1 is finally settled, and the other panels are hidden.
    await expect.poll(() => getPanelMotion(page)).toEqual({ [tab1]: "center" });
  });
});

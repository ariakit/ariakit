import { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import { test } from "../test-utils.ts";

const tab1 = "Popular";
const tab2 = "Recent";
const tab3 = "Explore";

test.describe.configure({ retries: 2 });

test("switch tabs", async ({ page }) => {
  const q = query(page);

  await expect(q.tab(tab1)).toHaveAttribute("aria-selected", "true");
  await expect(q.tabpanel(tab1)).toBeVisible();

  // [1]

  await q.tab(tab2).click();

  // [1]←[ ]←[2]

  await expect(q.tabpanel(tab1)).toBeVisible();
  await expect(q.tabpanel(tab2)).toBeVisible();

  // Tab 1 is sliding to the left
  await expect(q.tabpanel(tab1)).toHaveCSS("translate", /^-/);
  await expect(q.tabpanel(tab1)).toHaveCSS("opacity", /0\./);

  // Tab 2 is sliding from the right
  await expect(q.tabpanel(tab2)).toHaveCSS("translate", /^\d+\./);
  await expect(q.tabpanel(tab2)).toHaveCSS("opacity", /0\./);

  // Pressing the right arrow key before the animation is complete
  page.keyboard.press("ArrowRight");

  // [1]←[ ]←[2]←[3]

  await expect(q.tab(tab3)).toBeFocused();

  // All panels are visible now
  await expect(q.tabpanel(tab1)).toBeVisible();
  await expect(q.tabpanel(tab2)).toBeVisible();
  await expect(q.tabpanel(tab3)).toBeVisible();

  // Tab 1 is still sliding to the left
  await expect(q.tabpanel(tab1)).toHaveCSS("translate", /^-/);
  await expect(q.tabpanel(tab1)).toHaveCSS("opacity", /0\./);

  // Tab 2 is still sliding from the right
  await expect(q.tabpanel(tab2)).toHaveCSS("translate", /^\d+\./);
  await expect(q.tabpanel(tab2)).toHaveCSS("opacity", /0\./);

  // Tab 3 is sliding from the right
  await expect(q.tabpanel(tab3)).toHaveCSS("translate", /^\d+\./);
  await expect(q.tabpanel(tab3)).toHaveCSS("opacity", /0\./);

  // [1]←[2]←[ ]←[3]

  // Tab 2 is now sliding to the left
  await expect(q.tabpanel(tab2)).toHaveCSS("translate", /^-/);

  // Tab 3 is still sliding from the right
  await expect(q.tabpanel(tab3)).toHaveCSS("translate", /^\d+\./);
  await expect(q.tabpanel(tab3)).toHaveCSS("opacity", /0\./);

  // [3]

  // Tab 3 is finally settled
  await expect(q.tabpanel(tab3)).toHaveCSS("translate", "0px");
  await expect(q.tabpanel(tab3)).toHaveCSS("opacity", "1");

  await expect(q.tabpanel(tab1)).not.toBeVisible();
  await expect(q.tabpanel(tab2)).not.toBeVisible();
  await expect(q.tabpanel(tab3)).toBeVisible();

  // Pressing the Home key after the animation is complete
  page.keyboard.press("Home");

  // [1]→[ ]→[3]

  // Only the first and last panels are visible
  await expect(q.tab(tab1)).toBeFocused();
  await expect(q.tabpanel(tab1)).toBeVisible();
  await expect(q.tabpanel(tab3)).toBeVisible();

  // Tab 1 is sliding from the left
  await expect(q.tabpanel(tab1)).toHaveCSS("translate", /^-/);
  await expect(q.tabpanel(tab1)).toHaveCSS("opacity", /0\./);

  // Tab 3 is sliding to the right
  await expect(q.tabpanel(tab3)).toHaveCSS("translate", /^\d+\./);
  await expect(q.tabpanel(tab3)).toHaveCSS("opacity", /0\./);

  // [1]

  // Tab 1 is finally settled
  await expect(q.tabpanel(tab1)).toHaveCSS("translate", "0px");
  await expect(q.tabpanel(tab1)).toHaveCSS("opacity", "1");

  await expect(q.tabpanel(tab1)).toBeVisible();
  await expect(q.tabpanel(tab2)).not.toBeVisible();
  await expect(q.tabpanel(tab3)).not.toBeVisible();
});

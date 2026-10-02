import type { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

const filterCount = 12;
type Query = ReturnType<typeof query>;

interface FilterTarget {
  id: string;
  x: number;
  y: number;
}

// Setup resolves the submenu triggers once per iteration page, so the measured
// sweep needs no document-wide role locators on the 5,000-element page.
const filterTargets = new WeakMap<Page, FilterTarget[]>();

async function setupFilters(page: Page, q: Query, label: string) {
  await q.button(label).click();
  await expect(q.menu(label)).toBeVisible();
  const targets: FilterTarget[] = [];
  for (let i = 1; i <= filterCount; i++) {
    const filter = q.menuitem(`Filter ${i}`);
    const id = await filter.getAttribute("id");
    const box = await filter.boundingBox();
    if (!id) {
      throw new Error(`Filter ${i} has no id`);
    }
    if (!box) {
      throw new Error(`Filter ${i} has no bounding box`);
    }
    targets.push({ id, x: box.x + box.width / 2, y: box.y + box.height / 2 });
  }
  filterTargets.set(page, targets);
}

// Runs in the page. It reads only attributes, so it does not force a style
// recalculation of the tree outside.
function isSubmenuOpen(triggerId: string) {
  const trigger = document.getElementById(triggerId);
  const submenuId = trigger?.getAttribute("aria-controls");
  if (!submenuId) return false;
  const submenu = document.getElementById(submenuId);
  return !!submenu?.hasAttribute("data-open");
}

// Each move waits for its submenu, so every measured run does the same number
// of submenu transitions. The role assertions stay in verify.
async function hoverAcrossFilters(page: Page) {
  const targets = filterTargets.get(page);
  if (!targets) {
    throw new Error("setupFilters must run before the sweep");
  }
  for (const { id, x, y } of targets) {
    await page.mouse.move(x, y);
    // The perf project sets no action timeout. Match the 5s default of the role
    // assertions, so a submenu that does not open fails fast.
    await page.waitForFunction(isSubmenuOpen, id, { timeout: 5000 });
  }
}

async function verifyHoveredAcrossFilters(q: Query, label: string) {
  await expect(q.menu(`Filter ${filterCount}`)).toBeVisible();
  // The root menu and the last submenu.
  await expect(q.menu()).toHaveCount(2);
  await expect(q.menu(label)).toBeVisible();
}

// https://github.com/ariakit/ariakit/issues/7697
withFramework(import.meta.dirname, async ({ test }) => {
  test("hover across submenus in a modal menu", async ({ perf }) => {
    await perf.measure(({ page }) => hoverAcrossFilters(page), {
      scriptProfile: true,
      profileLimit: 20,
      setup: ({ page, q }) => setupFilters(page, q, "Modal filters"),
      verify: ({ q }) => verifyHoveredAcrossFilters(q, "Modal filters"),
    });
  });

  // Control: a nonmodal root menu does not disable the tree outside.
  test("hover across submenus in a nonmodal menu", async ({ perf }) => {
    await perf.measure(({ page }) => hoverAcrossFilters(page), {
      setup: ({ page, q }) => setupFilters(page, q, "Nonmodal filters"),
      verify: ({ q }) => verifyHoveredAcrossFilters(q, "Nonmodal filters"),
    });
  });
});

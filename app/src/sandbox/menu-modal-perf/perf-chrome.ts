import type { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

const filterCount = 12;
type Query = ReturnType<typeof query>;

async function setupFilters(q: Query, label: string) {
  await q.button(label).click();
  await expect(q.menu(label)).toBeVisible();
}

// Each hover waits for its submenu, so every measured run does the same number
// of submenu transitions.
async function hoverAcrossFilters(q: Query) {
  for (let i = 1; i <= filterCount; i++) {
    const filter = `Filter ${i}`;
    await q.menuitem(filter).hover();
    await expect(q.menu(filter)).toBeVisible();
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
    await perf.measure(({ q }) => hoverAcrossFilters(q), {
      scriptProfile: true,
      profileLimit: 20,
      setup: ({ q }) => setupFilters(q, "Modal filters"),
      verify: ({ q }) => verifyHoveredAcrossFilters(q, "Modal filters"),
    });
  });

  // Control: a nonmodal root menu does not disable the tree outside.
  test("hover across submenus in a nonmodal menu", async ({ perf }) => {
    await perf.measure(({ q }) => hoverAcrossFilters(q), {
      setup: ({ q }) => setupFilters(q, "Nonmodal filters"),
      verify: ({ q }) => verifyHoveredAcrossFilters(q, "Nonmodal filters"),
    });
  });
});

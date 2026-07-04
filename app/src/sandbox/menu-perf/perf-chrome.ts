import type { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

const itemCount = 20;
type Query = ReturnType<typeof query>;

async function openMenu(q: Query) {
  await q.button("Actions").click();
}

async function verifyMenuOpen(q: Query) {
  await expect(q.menu("Actions")).toBeVisible();
}

async function setupMenu(q: Query) {
  await openMenu(q);
  await verifyMenuOpen(q);
}

async function closeMenu(page: Page) {
  await page.keyboard.press("Escape");
}

async function verifyMenuClosed(q: Query) {
  await expect(q.menu("Actions")).not.toBeVisible();
}

async function setupMenuMove(page: Page, q: Query) {
  await setupMenu(q);
  await page.keyboard.press("Home");
  await expect(q.menuitem("Item 1")).toHaveAttribute("data-active-item");
}

async function moveAcrossItems(page: Page) {
  for (let i = 1; i < itemCount; i++) {
    await page.keyboard.press("ArrowDown");
  }
}

async function verifyMovedAcrossItems(q: Query) {
  await expect(q.menuitem(`Item ${itemCount}`)).toHaveAttribute(
    "data-active-item",
  );
}

withFramework(import.meta.dirname, async ({ test }) => {
  test("open menu", async ({ perf }) => {
    await perf.measure(({ q }) => openMenu(q), {
      verify: ({ q }) => verifyMenuOpen(q),
    });
  });

  test("close menu", async ({ perf }) => {
    await perf.measure(({ page }) => closeMenu(page), {
      setup: ({ q }) => setupMenu(q),
      verify: ({ q }) => verifyMenuClosed(q),
    });
  });

  test("move across items", async ({ perf }) => {
    await perf.measure(({ page }) => moveAcrossItems(page), {
      setup: ({ page, q }) => setupMenuMove(page, q),
      verify: ({ q }) => verifyMovedAcrossItems(q),
    });
  });

  // Same interaction as "open menu", but with the script profiler enabled
  // so the PR comment shows where the scripting time goes. Profiling adds
  // overhead, so the unprofiled test above is the one to read for timings.
  test("open menu (script profile)", async ({ perf }) => {
    await perf.measure(({ q }) => openMenu(q), {
      scriptProfile: true,
      profileLimit: 20,
      verify: ({ q }) => verifyMenuOpen(q),
    });
  });
});

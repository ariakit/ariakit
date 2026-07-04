import type { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

const itemCount = 20;
type Query = ReturnType<typeof query>;

async function openCombobox(q: Query) {
  await q.combobox("Search items").click();
}

async function verifyComboboxOpen(q: Query) {
  await expect(q.listbox()).toBeVisible();
}

async function setupCombobox(q: Query) {
  await openCombobox(q);
  await verifyComboboxOpen(q);
}

async function closeCombobox(page: Page) {
  await page.keyboard.press("Escape");
}

async function verifyComboboxClosed(q: Query) {
  await expect(q.listbox()).not.toBeVisible();
}

async function setupComboboxMove(page: Page, q: Query) {
  await setupCombobox(q);
  await page.keyboard.press("ArrowDown");
  await expect(q.option("Item 1")).toHaveAttribute("data-active-item");
}

async function moveAcrossItems(page: Page) {
  for (let i = 1; i < itemCount; i++) {
    await page.keyboard.press("ArrowDown");
  }
}

async function verifyMovedAcrossItems(q: Query) {
  await expect(q.option(`Item ${itemCount}`)).toHaveAttribute(
    "data-active-item",
  );
}

withFramework(import.meta.dirname, async ({ test }) => {
  test("open combobox", async ({ perf }) => {
    await perf.measure(({ q }) => openCombobox(q), {
      verify: ({ q }) => verifyComboboxOpen(q),
    });
  });

  test("close combobox", async ({ perf }) => {
    await perf.measure(({ page }) => closeCombobox(page), {
      setup: ({ q }) => setupCombobox(q),
      verify: ({ q }) => verifyComboboxClosed(q),
    });
  });

  test("move across items", async ({ perf }) => {
    await perf.measure(({ page }) => moveAcrossItems(page), {
      setup: ({ page, q }) => setupComboboxMove(page, q),
      verify: ({ q }) => verifyMovedAcrossItems(q),
    });
  });

  // Same interaction as "open combobox", but with the script profiler enabled
  // so the PR comment shows where the scripting time goes. Profiling adds
  // overhead, so the unprofiled test above is the one to read for timings.
  test("open combobox (script profile)", async ({ perf }) => {
    await perf.measure(({ q }) => openCombobox(q), {
      scriptProfile: true,
      profileLimit: 20,
      verify: ({ q }) => verifyComboboxOpen(q),
    });
  });
});

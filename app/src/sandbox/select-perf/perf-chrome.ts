import type { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

const itemCount = 20;
type Query = ReturnType<typeof query>;

async function openSelect(q: Query) {
  await q.combobox("Choose item").click();
}

async function verifySelectOpen(q: Query) {
  await expect(q.listbox()).toBeVisible();
}

async function setupSelect(q: Query) {
  await openSelect(q);
  await verifySelectOpen(q);
}

async function closeSelect(page: Page) {
  await page.keyboard.press("Escape");
}

async function verifySelectClosed(q: Query) {
  await expect(q.listbox()).not.toBeVisible();
}

async function setupSelectMove(q: Query) {
  await setupSelect(q);
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
  test("open select", async ({ perf }) => {
    await perf.measure(({ q }) => openSelect(q), {
      verify: ({ q }) => verifySelectOpen(q),
    });
  });

  test("close select", async ({ perf }) => {
    await perf.measure(({ page }) => closeSelect(page), {
      setup: ({ q }) => setupSelect(q),
      verify: ({ q }) => verifySelectClosed(q),
    });
  });

  test("move across items", async ({ perf }) => {
    await perf.measure(({ page }) => moveAcrossItems(page), {
      setup: ({ q }) => setupSelectMove(q),
      verify: ({ q }) => verifyMovedAcrossItems(q),
    });
  });

  // Same interaction as "open select", but with the script profiler enabled
  // so the PR comment shows where the scripting time goes. Profiling adds
  // overhead, so the unprofiled test above is the one to read for timings.
  test("open select (script profile)", async ({ perf }) => {
    await perf.measure(({ q }) => openSelect(q), {
      scriptProfile: true,
      profileLimit: 20,
      verify: ({ q }) => verifySelectOpen(q),
    });
  });
});

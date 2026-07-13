import type { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

const tabCount = 200;
type Query = ReturnType<typeof query>;

async function mountTabs(q: Query) {
  await q.button("Mount tabs").click();
  await expect(q.tab(`Tab ${tabCount}`)).toBeVisible();
}

async function verifyTabControlsPanel(q: Query, label: string) {
  const panelId = await q.tabpanel(label).getAttribute("id");
  if (!panelId) {
    throw new Error(`${label} panel must have an id`);
  }
  await expect(q.tab(label)).toHaveAttribute("aria-controls", panelId);
}

async function verifyTabsMounted(q: Query) {
  await expect(q.tab(`Tab ${tabCount}`)).toBeVisible();
  await expect(q.tab("Tab 1")).toHaveAttribute("aria-selected", "true");
  await expect(q.tab("Tab 1")).toHaveAttribute("type", "button");
  await expect(q.tabpanel("Tab 1")).toBeVisible();
  await verifyTabControlsPanel(q, "Tab 1");
}

async function setupTabs(q: Query) {
  await mountTabs(q);
  await verifyTabsMounted(q);
  const firstTab = q.tab("Tab 1");
  await firstTab.focus();
  await expect(firstTab).toBeFocused();
}

async function moveAcrossTabs(page: Page) {
  for (let i = 1; i < tabCount; i++) {
    await page.keyboard.press("ArrowRight");
  }
}

async function verifyMovedAcrossTabs(q: Query) {
  const lastTab = q.tab(`Tab ${tabCount}`);
  await expect(lastTab).toBeFocused();
  await expect(lastTab).toHaveAttribute("aria-selected", "true");
  await expect(q.tabpanel(`Tab ${tabCount}`)).toBeVisible();
  await verifyTabControlsPanel(q, `Tab ${tabCount}`);
}

withFramework(import.meta.dirname, async ({ test }) => {
  test("mount tabs", async ({ perf }) => {
    await perf.measure(({ q }) => mountTabs(q), {
      scriptProfile: true,
      verify: ({ q }) => verifyTabsMounted(q),
    });
  });

  test("move across tabs", async ({ perf }) => {
    await perf.measure(({ page }) => moveAcrossTabs(page), {
      scriptProfile: true,
      setup: ({ q }) => setupTabs(q),
      verify: ({ q }) => verifyMovedAcrossTabs(q),
    });
  });
});

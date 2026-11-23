import type { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import type { Page } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

type Query = ReturnType<typeof query>;

async function setup(page: Page, q: Query) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(q.tab("Support")).toHaveAttribute("aria-selected", "true");
  await expect(q.tabpanel("Support")).toBeVisible();
}

async function selectTab(q: Query, name: string) {
  await q.tab(name).click();
  await expect(q.tab(name)).toHaveAttribute("aria-selected", "true");
  await expect(q.tabpanel(name)).toBeVisible();
}

withFramework(import.meta.dirname, async ({ test }) => {
  test("select the next tab", async ({ perf }) => {
    await perf.measure(({ q }) => selectTab(q, "Sales"), {
      setup: ({ page, q }) => setup(page, q),
      verify: ({ q }) => expect(q.tabpanel("Support")).toBeHidden(),
    });
  });

  // The selected box travels over every tab, so its window shows a copy of each
  // one.
  test("select the last tab", async ({ perf }) => {
    await perf.measure(({ q }) => selectTab(q, "Recruiting"), {
      setup: ({ page, q }) => setup(page, q),
      verify: ({ q }) => expect(q.tabpanel("Support")).toBeHidden(),
    });
  });
});

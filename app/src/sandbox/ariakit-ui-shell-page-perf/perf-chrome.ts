import type { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

type Query = ReturnType<typeof query>;

function getSidebar(q: Query) {
  return q.navigation("Documentation");
}

withFramework(import.meta.dirname, async ({ test }) => {
  test("close a sidebar", async ({ perf }) => {
    await perf.measure(
      async ({ q }) => {
        await q.button("Toggle sidebar").click();
        // The panel leaves the accessibility tree when the fold ends.
        await expect(getSidebar(q)).toBeHidden();
      },
      {
        setup: async ({ page, q }) => {
          await page.setViewportSize({ width: 1600, height: 900 });
          await expect(getSidebar(q)).toBeVisible();
        },
        verify: ({ q }) => expect(getSidebar(q)).toBeHidden(),
      },
    );
  });

  test("open a sidebar", async ({ perf }) => {
    await perf.measure(
      async ({ q }) => {
        await q.button("Toggle sidebar").click();
        // The panel enters the accessibility tree on the first frame of the
        // fold. The column reaches its width when the fold ends.
        await expect(getSidebar(q).locator("..")).toHaveCSS("width", "320px");
      },
      {
        setup: async ({ page, q }) => {
          await page.setViewportSize({ width: 1600, height: 900 });
          await q.button("Toggle sidebar").click();
          await expect(getSidebar(q)).toBeHidden();
        },
        verify: ({ q }) => expect(getSidebar(q)).toBeVisible(),
      },
    );
  });
});

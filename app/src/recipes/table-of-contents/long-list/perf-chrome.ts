import type { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";
import { expectTocThumbStill } from "#app/test-utils/toc.ts";

type Query = ReturnType<typeof query>;

// Every other release from the second one, so each step moves the sections on
// screen and the thumb glides again. Later headings can't reach the activation
// line before the end of the page.
const minors = Array.from({ length: 7 }, (_, index) => 22 - index * 2);

function getNav(q: Query) {
  return q.navigation("Releases");
}

// https://github.com/ariakit/ariakit/issues/8141
withFramework(import.meta.dirname, async ({ test, query }) => {
  test("scroll through the releases of a long table of contents", async ({
    perf,
  }) => {
    await perf.measure(
      async ({ page, q }) => {
        for (const minor of minors) {
          await page.evaluate((id) => {
            document.getElementById(id)?.scrollIntoView({ block: "start" });
          }, `version-2-${minor}`);
          const link = query(getNav(q)).link(`Version 2.${minor}.0`);
          await expect(link).toHaveAttribute("aria-current", "location");
          await expectTocThumbStill(page, getNav(q));
        }
      },
      {
        setup: async ({ page, q }) => {
          await page.setViewportSize({ width: 1280, height: 800 });
          await expect(getNav(q)).toBeVisible();
          await expectTocThumbStill(page, getNav(q));
        },
        verify: async ({ q }) => {
          const link = query(getNav(q)).link("Version 2.10.0");
          await expect(link).toHaveAttribute("aria-current", "location");
        },
      },
    );
  });
});

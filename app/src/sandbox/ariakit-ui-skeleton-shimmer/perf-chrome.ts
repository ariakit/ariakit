import type { query } from "@ariakit/test/playwright";
import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

type Query = ReturnType<typeof query>;

async function expectLoaded(q: Query) {
  await expect(q.region("People")).toHaveAttribute("aria-busy", "false");
  await expect(q.text("Person 24")).toBeVisible();
}

// https://github.com/ariakit/ariakit/issues/8015
withFramework(import.meta.dirname, async ({ test }) => {
  test("reload a grid of shimmering placeholders", async ({ perf }) => {
    await perf.measure(
      async ({ q }) => {
        await q.button("Reload").click();
        // The placeholders animate until the simulated request resolves, so the
        // measurement ends when the content replaces them.
        await expectLoaded(q);
      },
      {
        setup: ({ q }) => expectLoaded(q),
        verify: ({ q }) => expectLoaded(q),
      },
    );
  });
});

import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("open dialog", async ({ perf }) => {
    await perf.measure(({ q }) => q.button("Open dialog").click(), {
      scriptProfile: true,
      verify: ({ q }) => expect(q.dialog("Settings")).toBeVisible(),
    });
  });

  test("close dialog", async ({ perf }) => {
    await perf.measure(({ q }) => q.button("Cancel").click(), {
      setup: async ({ q }) => {
        await q.button("Open dialog").click();
        await expect(q.dialog("Settings")).toBeVisible();
      },
      verify: ({ q }) => expect(q.dialog("Settings")).not.toBeVisible(),
    });
  });
});

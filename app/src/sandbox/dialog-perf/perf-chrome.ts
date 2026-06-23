import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("open dialog", async ({ q, perf }) => {
    await perf.measure(async () => {
      await q.button("Open dialog").click();
      await expect(q.dialog("Settings")).toBeVisible();
    });
  });

  test("close dialog", async ({ q, perf }) => {
    await perf.measure(
      async () => {
        await q.button("Cancel").click();
        await expect(q.dialog("Settings")).not.toBeVisible();
      },
      {
        setup: async () => {
          await q.button("Open dialog").click();
          await expect(q.dialog("Settings")).toBeVisible();
        },
      },
    );
  });

  // Same interaction as "open dialog", but with the script profiler enabled so
  // the PR comment shows where the scripting time goes. Profiling adds
  // overhead, so the unprofiled test above is the one to read for timings.
  test("open dialog with script profile", async ({ q, perf }) => {
    await perf.measure(
      async () => {
        await q.button("Open dialog").click();
        await expect(q.dialog("Settings")).toBeVisible();
      },
      {
        label: "open dialog (script profile)",
        scriptProfile: true,
        profileLimit: 20,
      },
    );
  });
});

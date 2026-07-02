import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("open dialog", async ({ q, perf }) => {
    await perf.measure(
      async () => {
        await q.button("Open dialog").click();
      },
      {
        verify: async () => {
          await expect(q.dialog("Settings")).toBeVisible();
        },
      },
    );
  });

  test("close dialog", async ({ q, perf }) => {
    await perf.measure(
      async () => {
        await q.button("Cancel").click();
      },
      {
        setup: async () => {
          await q.button("Open dialog").click();
          await expect(q.dialog("Settings")).toBeVisible();
        },
        verify: async () => {
          await expect(q.dialog("Settings")).not.toBeVisible();
        },
      },
    );
  });

  // Same interaction as "open dialog", but with the script profiler enabled
  // so the PR comment shows where the scripting time goes. Profiling adds
  // overhead, so the unprofiled test above is the one to read for timings.
  test("open dialog (script profile)", async ({ q, perf }) => {
    await perf.measure(
      async () => {
        await q.button("Open dialog").click();
      },
      {
        scriptProfile: true,
        profileLimit: 20,
        verify: async () => {
          await expect(q.dialog("Settings")).toBeVisible();
        },
      },
    );
  });
});

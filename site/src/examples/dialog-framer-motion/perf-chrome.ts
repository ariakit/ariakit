import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("open dialog", async ({ q, perf }) => {
    await perf.measure(async () => {
      await q.button("Show modal").click();
      await expect(q.dialog("Success")).toBeVisible();
    });
  });
});

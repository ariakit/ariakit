import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("show before JavaScript enhancement", async ({ page, q }) => {
    await page.addInitScript(() => {
      window.addEventListener("load", () => {
        const details = document.querySelector<HTMLDetailsElement>("details");
        if (details) {
          details.open = true;
        }
      });
    });
    await page.reload();
    await expect(q.dialog("Success")).toBeVisible();
    await expect(q.button("OK")).toBeFocused();
  });
});

import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("supports disclosure and dismiss keyboard interactions", async ({
    page,
    q,
  }) => {
    await expect(q.dialog("Success")).not.toBeAttached();
    await q.button("Show modal").click();
    await expect(q.dialog("Success")).toBeVisible();
    await expect(q.button("OK")).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(q.dialog("Success")).not.toBeAttached();
    await expect(q.button("Show modal")).toBeFocused();

    await q.button("Show modal").press("Enter");
    await expect(q.button("OK")).toBeFocused();
    await page.keyboard.press("Enter");
    await expect(q.dialog("Success")).not.toBeAttached();
    await expect(q.button("Show modal")).toBeFocused();

    await q.button("Show modal").press("Space");
    await expect(q.button("OK")).toBeFocused();
    await page.keyboard.press("Space");
    await expect(q.dialog("Success")).not.toBeAttached();
    await expect(q.button("Show modal")).toBeFocused();
  });

  test("outside dismissal does not restore disclosure focus", async ({
    page,
    q,
  }) => {
    await q.button("Show modal").click();
    await page.mouse.click(1, 1);
    await expect(q.dialog("Success")).not.toBeAttached();
    await expect(q.button("Show modal")).not.toBeFocused();
  });

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

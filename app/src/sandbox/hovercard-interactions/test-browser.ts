import type { Page } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

function hoverOutside(page: Page) {
  return page.mouse.move(0, 0);
}

withFramework(import.meta.dirname, async ({ test }) => {
  test("shows after hovering and hides after hovering outside", async ({
    page,
    q,
  }) => {
    const hovercard = q.dialog("Ariakit profile");
    await test.expect(hovercard).not.toBeVisible();

    await q.link("@ariakit.com").hover();
    await test.expect(hovercard).not.toBeVisible({ timeout: 1 });
    await test.expect(hovercard).toBeVisible();

    await hoverOutside(page);
    await test.expect(hovercard).toBeVisible({ timeout: 1 });
    await test.expect(hovercard).not.toBeVisible();
  });

  test("stays open while focused", async ({ page, q }) => {
    const hovercard = q.dialog("Ariakit profile");
    await q.link("@ariakit.com").hover();
    await test.expect(hovercard).toBeVisible();
    await q.button("Follow").click();

    await hoverOutside(page);
    await page.waitForTimeout(50);
    await test.expect(hovercard).toBeVisible();
  });

  test("stays open when the pointer quickly returns", async ({ page, q }) => {
    const anchor = q.link("@ariakit.com");
    const hovercard = q.dialog("Ariakit profile");

    await anchor.hover();
    await test.expect(hovercard).toBeVisible();
    await hoverOutside(page);
    await anchor.hover();
    await test.expect(hovercard).toBeVisible();

    await hoverOutside(page);
    await q.button("Follow").hover();
    await page.waitForTimeout(50);
    await test.expect(hovercard).toBeVisible();
  });

  test("Escape closes an unfocused hovercard without moving focus", async ({
    page,
    q,
  }) => {
    const anchor = q.link("@ariakit.com");
    await anchor.hover();
    await test.expect(q.dialog("Ariakit profile")).toBeVisible();

    await page.keyboard.press("Escape");
    await test.expect(q.dialog("Ariakit profile")).not.toBeVisible();
    await test.expect(anchor).not.toBeFocused();
  });

  test("Escape closes a focused hovercard and restores the anchor", async ({
    page,
    q,
  }) => {
    const anchor = q.link("@ariakit.com");
    await anchor.hover();
    await q.button("Follow").click();

    await page.keyboard.press("Escape");
    await test.expect(q.dialog("Ariakit profile")).not.toBeVisible();
    await test.expect(anchor).toBeFocused();
  });
});

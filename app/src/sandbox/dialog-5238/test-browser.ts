import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

function isInert(locator: Locator) {
  return locator.evaluate((element) => element.closest("[inert]") !== null);
}

withFramework(import.meta.dirname, async ({ test }) => {
  // Reproduces https://github.com/ariakit/ariakit/issues/5238
  test("keeps the frontmost initially open sibling dialog interactive", async ({
    page,
    q,
  }) => {
    await test.expect(q.dialog("Apples")).toBeVisible();
    await test.expect.poll(() => isInert(q.dialog("Oranges"))).toBe(true);
    await q.button("Eat apple").click();
    await test.expect(q.status("Apple count")).toHaveText("Apples eaten: 1");

    const applesId = await q.dialog("Apples").getAttribute("id");
    await page
      .locator(`[data-backdrop="${applesId}"]`)
      .click({ button: "right", position: { x: 4, y: 4 } });
    await test.expect(q.dialog("Apples")).not.toBeVisible();
    await test.expect(page.locator("[data-dialog]")).toHaveCount(1);
    await test.expect(q.dialog("Oranges")).toBeVisible();
    await q.button("Eat orange").press("Enter");
    await test.expect(q.status("Orange count")).toHaveText("Oranges eaten: 1");
  });

  // Reproduces the backdrop replacement case found while fixing #5238.
  test("keeps the background open after replacing the foreground backdrop", async ({
    page,
    q,
  }) => {
    const applesId = await q.dialog("Apples").getAttribute("id");
    const previousBackdrop = page.locator(`[data-backdrop="${applesId}"]`);
    await previousBackdrop.evaluate((element) => {
      element.setAttribute("data-previous-backdrop", "");
    });

    await q.button("Replace apple backdrop").click();
    await test.expect(page.locator("[data-previous-backdrop]")).toHaveCount(0);

    await page
      .locator("[data-replacement-backdrop]")
      .click({ button: "right", position: { x: 4, y: 4 } });

    await test.expect(q.dialog("Apples")).not.toBeVisible();
    await test.expect(page.locator("[data-dialog]")).toHaveCount(1);
    await test.expect(q.dialog("Oranges")).toBeVisible();
  });

  // Reproduces the dialog host replacement case found while fixing #5238.
  test("preserves the stack order when replacing the background dialog", async ({
    page,
    q,
  }) => {
    await q.button("Replace orange dialog").click();

    await test.expect(page.locator("[data-replacement-dialog]")).toBeVisible();
    await test.expect(q.dialog("Apples")).toBeVisible();
    await test.expect.poll(() => isInert(q.dialog("Oranges"))).toBe(true);
    await q.button("Eat apple").click();
    await test.expect(q.status("Apple count")).toHaveText("Apples eaten: 1");
  });

  test("keeps an inline replacement behind the foreground dialog", async ({
    page,
    q,
  }) => {
    await q.button("Close both dialogs").click();
    await q.button("Open inline orange dialog").click();
    await q.button("Open apples").click();
    await q.button("Replace orange dialog").click();

    await test.expect(page.locator("[data-replacement-dialog]")).toBeVisible();
    await test.expect(q.dialog("Apples")).toBeVisible();
    await test.expect.poll(() => isInert(q.dialog("Oranges"))).toBe(true);
  });

  test("keeps a custom-portaled background dialog inert", async ({
    page,
    q,
  }) => {
    await q.button("Close both dialogs").click();
    await q.button("Open inline orange dialog").click();
    await q.button("Open apples").click();
    await test.expect.poll(() => isInert(q.dialog("Oranges"))).toBe(true);
    await q.button("Move orange dialog to custom portal").click();

    await test.expect(page.locator("[data-custom-portal]")).toHaveCount(1);
    await test.expect(q.dialog("Apples")).toBeVisible();
    await test.expect.poll(() => isInert(q.dialog("Oranges"))).toBe(true);
  });

  test("keeps a reopened mounted sibling above the previous foreground", async ({
    q,
  }) => {
    await q.button("Hide orange dialog").click();
    await test.expect(q.dialog("Apples")).toBeVisible();

    await q.button("Show orange dialog").click();
    await test.expect(q.dialog("Oranges")).toBeVisible();
    await test.expect.poll(() => isInert(q.dialog("Apples"))).toBe(true);
    await q.button("Eat orange").click();
    await test.expect(q.status("Orange count")).toHaveText("Oranges eaten: 1");
  });

  test("preserves third-party dialogs mounted after the background dialog", async ({
    q,
  }) => {
    await q.button("Close apples").click();
    await q.button("Open third-party dialog").click();
    await test.expect(q.dialog("Third-party")).toBeVisible();
    await test.expect.poll(() => isInert(q.dialog("Third-party"))).toBe(false);

    await q.button("Open apples from third-party").press("Enter");
    await test.expect(q.dialog("Apples")).toBeVisible();
    await q.button("Close apples").click();

    await test.expect(q.dialog("Third-party")).toBeVisible();
    await test.expect.poll(() => isInert(q.dialog("Third-party"))).toBe(false);
    await q.button("Interact with third-party").press("Enter");
    await test
      .expect(q.status("Third-party count"))
      .toHaveText("Third-party interactions: 1");
  });

  test("preserves reopened sibling order in fullscreen", async ({
    page,
    q,
  }) => {
    await q.button("Hide orange dialog").click();
    await q.button("Show orange dialog").click();
    await test.expect.poll(() => isInert(q.dialog("Oranges"))).toBe(false);
    await test.expect.poll(() => isInert(q.dialog("Apples"))).toBe(true);
    await q.button("Enter fullscreen").click();

    const host = page.locator("[data-fullscreen-host]");
    await page.waitForFunction(() => document.fullscreenElement != null);
    await test.expect
      .poll(() =>
        host
          .locator(":scope > div")
          .evaluateAll((portals) =>
            portals.flatMap((portal) =>
              Array.from(
                portal.querySelectorAll("[data-dialog]"),
                (dialog) =>
                  dialog.getAttribute("aria-label") ||
                  dialog.getAttribute("aria-labelledby"),
              ),
            ),
          ),
      )
      .toEqual([
        await q.dialog("Apples").getAttribute("aria-labelledby"),
        await q.dialog("Oranges").getAttribute("aria-labelledby"),
      ]);
    await test.expect.poll(() => isInert(q.dialog("Apples"))).toBe(true);
    await test.expect.poll(() => isInert(q.dialog("Oranges"))).toBe(false);
    await q.button("Eat orange").click();
    await test.expect(q.status("Orange count")).toHaveText("Oranges eaten: 1");
  });

  test("preserves sibling order when the background moves into a portal", async ({
    q,
  }) => {
    await q.button("Close both dialogs").click();
    await q.button("Open inline orange dialog").click();
    await q.button("Open apples").click();

    await test.expect(q.dialog("Apples")).toBeVisible();
    await test.expect.poll(() => isInert(q.dialog("Oranges"))).toBe(true);
    await q.button("Move orange dialog to portal").click();
    await test.expect(q.dialog("Apples")).toBeVisible();
    await test.expect.poll(() => isInert(q.dialog("Oranges"))).toBe(true);
    await q.button("Eat apple").click();
    await test.expect(q.status("Apple count")).toHaveText("Apples eaten: 1");
  });
});

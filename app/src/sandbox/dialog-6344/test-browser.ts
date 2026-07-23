import type { Locator, Page } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

async function moveMouseTo(page: Page, locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error("Element has no box");
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
}

// Reproduces https://github.com/ariakit/ariakit/issues/6344
withFramework(import.meta.dirname, async ({ test }) => {
  test("stays open when interacting with a persistent element before the dialog is focused", async ({
    page,
    q,
  }) => {
    await q.button("Open dialog").click();
    await test.expect(q.dialog("Dialog")).toBeVisible();

    // The dialog hasn't been focused yet (autoFocusOnShow={false}). Clicking
    // the persistent field must not close it. The bounded timeout guards
    // against the assertion passing before the dialog processes the hide.
    await q.textbox("Notification field").click();
    await test.expect(q.textbox("Notification field")).toBeFocused();
    await page.waitForTimeout(250);
    await test.expect(q.dialog("Dialog")).toBeVisible();

    // Other interactions with the persistent region must not close it either.
    await q.button("Dismiss notification").click();
    await page.waitForTimeout(250);
    await test.expect(q.dialog("Dialog")).toBeVisible();
  });

  test("stays open on right-clicking a persistent element before the dialog is focused", async ({
    page,
    q,
  }) => {
    await q.button("Open dialog").click();
    await test.expect(q.dialog("Dialog")).toBeVisible();

    await q.textbox("Notification field").click({ button: "right" });
    await page.waitForTimeout(250);
    await test.expect(q.dialog("Dialog")).toBeVisible();
  });

  test("keeps the documented behavior after the dialog has been focused", async ({
    page,
    q,
  }) => {
    await q.button("Open dialog").click();
    await test.expect(q.dialog("Dialog")).toBeVisible();

    // Focusing inside the dialog first is the documented, working path.
    await q.textbox("Inside field").click();
    await test.expect(q.textbox("Inside field")).toBeFocused();

    await q.textbox("Notification field").click();
    await test.expect(q.textbox("Notification field")).toBeFocused();
    await page.waitForTimeout(250);
    await test.expect(q.dialog("Dialog")).toBeVisible();
  });

  // Regression for https://github.com/ariakit/ariakit/pull/6810#discussion_r3635586651
  test("keeps persistent elements after replacing an open dialog node", async ({
    page,
    q,
  }) => {
    await q.button("Open dialog").click();
    await q.button("Replace dialog element").click();
    await test
      .expect(q.dialog("Dialog"))
      .toHaveJSProperty("tagName", "SECTION");

    await q.textbox("Notification field").click();
    await test.expect(q.textbox("Notification field")).toBeFocused();
    await page.waitForTimeout(250);
    await test.expect(q.dialog("Dialog")).toBeVisible();
  });

  test("stays open when interacting with a persistent shadow element", async ({
    page,
    q,
  }) => {
    await q.button("Open dialog").click();
    await test.expect(q.dialog("Dialog")).toBeVisible();

    const persistentInput = q.textbox("Persistent shadow field");
    await moveMouseTo(page, persistentInput);
    await page.mouse.down();
    await persistentInput.focus();
    await page.mouse.up();
    await test.expect(persistentInput).toBeFocused();
    await page.waitForTimeout(250);
    await test.expect(q.dialog("Dialog")).toBeVisible();

    await q.textbox("Inside field").click();
    const persistentButton = q.button("Persistent shadow button");
    await moveMouseTo(page, persistentButton);
    await page.mouse.down();
    await page.mouse.up();
    await test.expect(q.textbox("Inside field")).toBeFocused();
    await page.waitForTimeout(250);
    await test.expect(q.dialog("Dialog")).toBeVisible();
  });

  test("ignores focus events from disconnected shadow elements", async ({
    page,
    q,
  }) => {
    await q.button("Open dialog").click();
    await test.expect(q.dialog("Dialog")).toBeVisible();

    await page.getByTestId("shadow-host").evaluate((host) => {
      const input = host.shadowRoot?.querySelector<HTMLInputElement>(
        "[data-disconnected-shadow-field]",
      );
      if (!input) throw new Error("Missing disconnected shadow field");
      input.focus();
    });
    await test.expect(q.textbox("Disconnected shadow field")).toHaveCount(0);
    await page.waitForTimeout(250);
    await test.expect(q.dialog("Dialog")).toBeVisible();
  });

  test("still closes when interacting outside before the dialog is focused", async ({
    q,
  }) => {
    await q.button("Open dialog").click();
    await test.expect(q.dialog("Dialog")).toBeVisible();

    await q.textbox("Outside field").click();
    await test.expect(q.dialog("Dialog")).not.toBeVisible();
  });

  test("closes when interacting inside an unrelated shadow root", async ({
    q,
  }) => {
    await q.button("Open dialog").click();
    await test.expect(q.dialog("Dialog")).toBeVisible();

    await q.textbox("Inside field").click();
    await q.textbox("Outside shadow field").click();
    await test.expect(q.dialog("Dialog")).not.toBeVisible();
  });

  // Regression for https://github.com/ariakit/ariakit/pull/6810#discussion_r3635034591
  test("closes when interacting with a same-id dialog in another root", async ({
    q,
  }) => {
    await q.button("Show shadow dialog").click();
    await q.button("Open dialog").click();
    await test.expect(q.dialog("Dialog")).toBeVisible();

    await q.textbox("Shadow dialog field").click();
    await test.expect(q.dialog("Dialog")).not.toBeVisible();
  });

  // Regression for https://github.com/ariakit/ariakit/pull/6810#discussion_r3635035742
  test("closes on a no-focus outside shadow click", async ({ q }) => {
    await q.button("Open dialog").click();
    await test.expect(q.dialog("Dialog")).toBeVisible();

    await q.button("Outside shadow button").click();
    await test.expect(q.dialog("Dialog")).not.toBeVisible();
  });

  // Regression for https://github.com/ariakit/ariakit/pull/6810#discussion_r3635035742
  test("stays open when dragging from persistent shadow content", async ({
    page,
    q,
  }) => {
    await q.button("Open dialog").click();
    await test.expect(q.dialog("Dialog")).toBeVisible();

    const persistentButton = q.button("Persistent shadow button");
    const outsideButton = q.button("Outside shadow button");
    await moveMouseTo(page, persistentButton);
    await page.mouse.down();
    await moveMouseTo(page, outsideButton);
    await page.mouse.up();
    await test.expect(q.dialog("Dialog")).toBeVisible();
  });
});

import type { Locator } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

async function getLeft(locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) {
    throw new Error("Element has no bounding box");
  }
  return box.x;
}

withFramework(import.meta.dirname, async ({ test }) => {
  // Menu buttons that share a store and receive inline ref callbacks re-attach
  // their refs when the owner re-renders on open. The button that opened the
  // menu must keep it, and the menu must open under that button.
  // https://github.com/ariakit/ariakit/issues/8088
  test("keeps the menu on the second button when it opens the menu", async ({
    q,
  }) => {
    const formatting = q.button("Formatting");
    const quickFormat = q.button("Quick format");

    await quickFormat.click();

    await test.expect(q.text("Menu: open")).toBeVisible();
    // The buttons are far apart, so the menu's left edge shows which button
    // anchors it. The popover rounds its position to device pixels.
    const quickFormatLeft = await getLeft(quickFormat);
    await test.expect
      .poll(async () => Math.abs((await getLeft(q.menu())) - quickFormatLeft))
      .toBeLessThanOrEqual(1);
    await test.expect(q.menu("Quick format")).toBeVisible();
    await test.expect(quickFormat).toHaveAttribute("aria-expanded", "true");
    await test.expect(formatting).toHaveAttribute("aria-expanded", "false");
  });

  // https://github.com/ariakit/ariakit/issues/8088
  test("moves the menu to the button that opens it again", async ({ q }) => {
    const formatting = q.button("Formatting");
    const quickFormat = q.button("Quick format");

    await formatting.click();
    await test.expect(q.menu("Formatting")).toBeVisible();
    await formatting.click();
    await test.expect(q.text("Menu: closed")).toBeVisible();

    await quickFormat.click();

    await test.expect(q.menu("Quick format")).toBeVisible();
    await test.expect(quickFormat).toHaveAttribute("aria-expanded", "true");
    await test.expect(formatting).toHaveAttribute("aria-expanded", "false");

    await quickFormat.click();
    await test.expect(q.text("Menu: closed")).toBeVisible();

    await formatting.click();

    await test.expect(q.menu("Formatting")).toBeVisible();
    await test.expect(formatting).toHaveAttribute("aria-expanded", "true");
    await test.expect(quickFormat).toHaveAttribute("aria-expanded", "false");
  });
});

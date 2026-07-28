import { expect } from "@playwright/test";
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  test("popover is positioned correctly", async ({ page }) => {
    await page.setViewportSize({ width: 800, height: 600 });
    const textarea = page.getByRole("combobox", { name: "Comment" });
    await textarea.click({ position: { x: 10, y: 10 } });
    await textarea.type("Hello @a");
    const popover = page.getByRole("listbox");
    await expect(popover).toBeVisible();
    const textareaBox = (await textarea.boundingBox())!;
    const initialPopoverBox = (await popover.boundingBox())!;
    expect(initialPopoverBox.x).toBeGreaterThanOrEqual(textareaBox.x);
    expect(initialPopoverBox.x).toBeLessThan(textareaBox.x + textareaBox.width);
    expect(initialPopoverBox.y).toBeGreaterThan(textareaBox.y);

    await textarea.type("\n\n\n\n\n\n\n\n\n\n");
    await textarea.press("ArrowUp");
    await textarea.press("ArrowUp");
    await textarea.press("ArrowUp");
    await textarea.press("ArrowUp");
    await textarea.type("@");
    const movedPopoverBox = (await popover.boundingBox())!;
    expect(movedPopoverBox.y).not.toBe(initialPopoverBox.y);

    const initialScrollTop = await textarea.evaluate((element) => {
      return element.scrollTop;
    });
    await page.mouse.move(textareaBox.x + 10, textareaBox.y + 10);
    await page.mouse.wheel(0, -50);
    await expect
      .poll(() => textarea.evaluate((element) => element.scrollTop))
      .toBeLessThan(initialScrollTop);
    const scrolledPopoverBox = (await popover.boundingBox())!;
    expect(scrolledPopoverBox.y).not.toBe(movedPopoverBox.y);
  });
});

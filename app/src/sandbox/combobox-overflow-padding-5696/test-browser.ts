// See https://github.com/ariakit/ariakit/issues/5696
import type { Locator, Page } from "@playwright/test";
import { flushFrames, withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
  // The popover updates its position on the frames after it opens or the
  // viewport resizes, as the autoUpdate observers report the new sizes, and no
  // state marks the last update. Read the count once it holds across frames.
  const readSettledCount = async (page: Page, positionUpdates: Locator) => {
    await test.expect(positionUpdates).not.toHaveText("0");
    await test
      .expect(async () => {
        const count = await positionUpdates.textContent();
        await flushFrames(page);
        test.expect(await positionUpdates.textContent()).toBe(count);
      })
      .toPass();
    return positionUpdates.textContent();
  };

  test("uses the greatest horizontal overflow padding for CSS sizing", async ({
    page,
    q,
  }) => {
    await page.setViewportSize({ width: 800, height: 600 });

    const popover = q.listbox();
    await test.expect(popover).toBeVisible();
    await test.expect(popover).toHaveCSS("width", "736px");

    const combobox = q.combobox("Favorite fruit");
    await combobox.click();
    await combobox.press("Escape");
    await test.expect(popover).toBeHidden();
    await combobox.click();
    await test.expect(popover).toBeVisible();
    await test.expect(popover).toHaveCSS("width", "736px");
  });

  test("does not reposition when inline padding values are unchanged", async ({
    page,
    q,
  }) => {
    const popover = q.listbox();
    const positionUpdates = q.status("Position updates");
    await test.expect(popover).toBeVisible();
    const initialPositionUpdates = await readSettledCount(
      page,
      positionUpdates,
    );

    await q.button("Rerender").click();

    await test.expect(popover).toBeVisible();
    await test.expect(positionUpdates).toHaveText(initialPositionUpdates ?? "");
  });

  test("repositions when an inline padding value changes", async ({
    page,
    q,
  }) => {
    await page.setViewportSize({ width: 800, height: 600 });

    const popover = q.listbox();
    const positionUpdates = q.status("Position updates");
    await test.expect(popover).toBeVisible();
    const initialPositionUpdates = await readSettledCount(
      page,
      positionUpdates,
    );

    await q.button("Change padding").click();

    await test.expect(popover).toBeVisible();
    await test
      .expect(positionUpdates)
      .not.toHaveText(initialPositionUpdates ?? "");
    await test.expect(popover).toHaveCSS("width", "720px");
  });
});

// See https://github.com/ariakit/ariakit/issues/5696
import { withFramework } from "#app/test-utils/preview.ts";

withFramework(import.meta.dirname, async ({ test }) => {
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
    q,
  }) => {
    const popover = q.listbox();
    const positionUpdates = q.status("Position updates");
    await test.expect(popover).toBeVisible();
    await test.expect(positionUpdates).not.toHaveText("0");
    const initialPositionUpdates = await positionUpdates.textContent();

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
    await test.expect(positionUpdates).not.toHaveText("0");
    const initialPositionUpdates = await positionUpdates.textContent();

    await q.button("Change padding").click();

    await test.expect(popover).toBeVisible();
    await test
      .expect(positionUpdates)
      .not.toHaveText(initialPositionUpdates ?? "");
    await test.expect(popover).toHaveCSS("width", "720px");
  });
});
